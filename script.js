const appState = {
  profile: {
    name: 'Mi Pastelería',
    contact: 'Agregá tus datos de contacto para mostrarlos aquí.',
    logo: ''
  },
  currentProduct: {
    name: '',
    notes: '',
    portions: '',
    markup: 60,
    ingredients: []
  },
  savedProducts: [],
  selectedProductId: null
}

const selectors = {
  profileName: document.getElementById('profileName'),
  profileContact: document.getElementById('profileContact'),
  profileLogo: document.getElementById('profileLogo'),
  brandName: document.getElementById('brandName'),
  brandContact: document.getElementById('brandContact'),
  brandLogo: document.getElementById('brandLogo'),
  previewBrand: document.getElementById('previewBrand'),
  previewContact: document.getElementById('previewContact'),
  previewLogo: document.getElementById('previewLogo'),

  productName: document.getElementById('productName'),
  productNotes: document.getElementById('productNotes'),
  productPortions: document.getElementById('productPortions'),
  productMarkup: document.getElementById('productMarkup'),

  ingredientName: document.getElementById('ingredientName'),
  ingredientQuantity: document.getElementById('ingredientQuantity'),
  ingredientPrice: document.getElementById('ingredientPrice'),
  ingredientNotes: document.getElementById('ingredientNotes'),
  ingredientList: document.getElementById('ingredientList'),

  ingredientCost: document.getElementById('ingredientCost'),
  markupValue: document.getElementById('markupValue'),
  finalPrice: document.getElementById('finalPrice'),

  saveProduct: document.getElementById('saveProduct'),
  clearProducts: document.getElementById('clearProducts'),
  productsContainer: document.getElementById('productsContainer'),
  noProductsMessage: document.getElementById('noProductsMessage'),

  previewProduct: document.getElementById('previewProduct'),
  previewNotes: document.getElementById('previewNotes'),
  previewIngredients: document.getElementById('previewIngredients'),
  previewIngredientCost: document.getElementById('previewIngredientCost'),
  previewMarkup: document.getElementById('previewMarkup'),
  previewFinalPrice: document.getElementById('previewFinalPrice'),

  shareBudget: document.getElementById('shareBudget'),
  printBudget: document.getElementById('printBudget')
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(value || 0)
}

function readFormNumber(input) {
  const value = parseFloat(input.value)
  return Number.isFinite(value) ? value : 0
}

function updateProfileState() {
  appState.profile.name = selectors.profileName.value.trim() || 'Mi Pastelería'
  appState.profile.contact = selectors.profileContact.value.trim() || 'Agregá tus datos de contacto para mostrarlos aquí.'
  renderProfile()
}

function handleLogoUpload(event) {
  const [file] = event.target.files
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('Seleccioná un archivo de imagen válido (png, jpg, etc.).')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    appState.profile.logo = reader.result
    renderProfile()
  }
  reader.readAsDataURL(file)
}

function renderProfile() {
  selectors.brandName.textContent = appState.profile.name
  selectors.brandContact.textContent = appState.profile.contact
  selectors.previewBrand.textContent = appState.profile.name
  selectors.previewContact.textContent = appState.profile.contact

  if (appState.profile.logo) {
    selectors.brandLogo.src = appState.profile.logo
    selectors.previewLogo.src = appState.profile.logo
    selectors.brandLogo.style.display = 'block'
    selectors.previewLogo.style.display = 'block'
  } else {
    selectors.brandLogo.removeAttribute('src')
    selectors.previewLogo.removeAttribute('src')
    selectors.brandLogo.style.display = 'none'
    selectors.previewLogo.style.display = 'none'
  }
}

function resetIngredientForm() {
  selectors.ingredientName.value = ''
  selectors.ingredientQuantity.value = ''
  selectors.ingredientPrice.value = ''
  selectors.ingredientNotes.value = ''
  selectors.ingredientName.focus()
}

function addIngredient(event) {
  event.preventDefault()
  const name = selectors.ingredientName.value.trim()
  const quantity = readFormNumber(selectors.ingredientQuantity)
  const pricePerKg = readFormNumber(selectors.ingredientPrice)
  const notes = selectors.ingredientNotes.value.trim()

  if (!name || quantity <= 0 || pricePerKg <= 0) {
    alert('Completá ingrediente, cantidad y precio por kilo con valores válidos.')
    return
  }

  const ingredient = {
    id: crypto.randomUUID(),
    name,
    quantity,
    pricePerKg,
    notes,
    cost: (quantity / 1000) * pricePerKg
  }

  appState.currentProduct.ingredients.push(ingredient)
  renderIngredients()
  updateTotals()
  updatePreviewWithCurrentProduct()
  resetIngredientForm()
}

function removeIngredient(id) {
  appState.currentProduct.ingredients = appState.currentProduct.ingredients.filter(ing => ing.id !== id)
  renderIngredients()
  updateTotals()
  updatePreviewWithCurrentProduct()
}

function renderIngredients() {
  const ingredients = appState.currentProduct.ingredients
  const container = selectors.ingredientList
  container.innerHTML = ''

  if (!ingredients.length) {
    const empty = document.createElement('p')
    empty.className = 'empty-message'
    empty.textContent = 'Cargá tus ingredientes para ver el costo.'
    container.appendChild(empty)
    return
  }

  ingredients.forEach(ingredient => {
    const item = document.createElement('article')
    item.className = 'ingredient-item'
    item.innerHTML = `
      <div>
        <p class="ingredient-name">${ingredient.name}</p>
        <p class="ingredient-meta">${ingredient.quantity} g · ${formatCurrency(ingredient.pricePerKg)} / kg</p>
        ${ingredient.notes ? `<p class="ingredient-notes">${ingredient.notes}</p>` : ''}
      </div>
      <div class="ingredient-actions">
        <span class="ingredient-cost">${formatCurrency(ingredient.cost)}</span>
        <button type="button" data-id="${ingredient.id}" class="ghost-button small">Quitar</button>
      </div>
    `
    container.appendChild(item)
  })

  container.querySelectorAll('button[data-id]').forEach(button => {
    button.addEventListener('click', (event) => {
      const id = event.currentTarget.getAttribute('data-id')
      removeIngredient(id)
    })
  })
}

function updateTotals() {
  appState.currentProduct.name = selectors.productName.value.trim()
  appState.currentProduct.notes = selectors.productNotes.value.trim()
  appState.currentProduct.portions = selectors.productPortions.value.trim()
  appState.currentProduct.markup = readFormNumber(selectors.productMarkup)

  const baseCost = appState.currentProduct.ingredients.reduce((acc, ing) => acc + ing.cost, 0)
  const markupValue = baseCost * (appState.currentProduct.markup / 100)
  const finalPrice = baseCost + markupValue

  selectors.ingredientCost.textContent = formatCurrency(baseCost)
  selectors.markupValue.textContent = formatCurrency(markupValue)
  selectors.finalPrice.textContent = formatCurrency(finalPrice)

  return { baseCost, markupValue, finalPrice }
}

function updatePreviewWithCurrentProduct() {
  const totals = updateTotals()
  const product = appState.currentProduct

  if (!product.name) {
    selectors.previewProduct.textContent = 'Ingresá el nombre del producto para generar el presupuesto.'
  } else {
    selectors.previewProduct.textContent = `${product.name}${product.portions ? ` · ${product.portions} unidades` : ''}`
  }

  selectors.previewNotes.textContent = product.notes

  selectors.previewIngredients.innerHTML = ''
  if (!product.ingredients.length) {
    const empty = document.createElement('li')
    empty.className = 'empty-message'
    empty.textContent = 'Todavía no cargaste ingredientes.'
    selectors.previewIngredients.appendChild(empty)
  } else {
    product.ingredients.forEach(ingredient => {
      const li = document.createElement('li')
      li.textContent = `${ingredient.name}: ${ingredient.quantity} g — ${formatCurrency(ingredient.cost)}`
      selectors.previewIngredients.appendChild(li)
    })
  }

  selectors.previewIngredientCost.textContent = formatCurrency(totals.baseCost)
  selectors.previewMarkup.textContent = `${product.markup || 0}%`
  selectors.previewFinalPrice.textContent = formatCurrency(totals.finalPrice)
}

function clearCurrentProduct() {
  appState.currentProduct = {
    name: '',
    notes: '',
    portions: '',
    markup: readFormNumber(selectors.productMarkup) || 60,
    ingredients: []
  }
  selectors.productName.value = ''
  selectors.productNotes.value = ''
  selectors.productPortions.value = ''
  selectors.productMarkup.value = appState.currentProduct.markup
  renderIngredients()
  updateTotals()
  updatePreviewWithCurrentProduct()
}

function saveCurrentProduct() {
  const totals = updateTotals()
  const product = appState.currentProduct

  if (!product.name) {
    alert('Agregá un nombre para el producto antes de guardarlo.')
    selectors.productName.focus()
    return
  }

  if (!product.ingredients.length) {
    alert('Necesitás al menos un ingrediente para guardar el producto.')
    selectors.ingredientName.focus()
    return
  }

  const newProduct = {
    id: crypto.randomUUID(),
    name: product.name,
    notes: product.notes,
    portions: product.portions,
    markup: product.markup,
    ingredients: product.ingredients.map(ing => ({ ...ing })),
    totals
  }

  appState.savedProducts.unshift(newProduct)
  appState.selectedProductId = newProduct.id
  renderSavedProducts()
  fillPreview(newProduct)
  clearCurrentProduct()
}

function renderSavedProducts() {
  const container = selectors.productsContainer
  container.innerHTML = ''

  if (!appState.savedProducts.length) {
    selectors.noProductsMessage.style.display = 'block'
    return
  }

  selectors.noProductsMessage.style.display = 'none'

  appState.savedProducts.forEach(product => {
    const card = document.createElement('article')
    card.className = 'product-card'
    if (product.id === appState.selectedProductId) {
      card.classList.add('selected')
    }
    card.innerHTML = `
      <div>
        <h3>${product.name}</h3>
        ${product.portions ? `<p class="product-meta">${product.portions} unidades</p>` : ''}
        ${product.notes ? `<p class="product-notes">${product.notes}</p>` : ''}
      </div>
      <div class="product-price">${formatCurrency(product.totals.finalPrice)}</div>
    `

    card.addEventListener('click', () => {
      appState.selectedProductId = product.id
      renderSavedProducts()
      fillPreview(product)
    })

    container.appendChild(card)
  })
}

function fillPreview(product) {
  selectors.previewProduct.textContent = `${product.name}${product.portions ? ` · ${product.portions} unidades` : ''}`
  selectors.previewNotes.textContent = product.notes || ''

  selectors.previewIngredients.innerHTML = ''
  product.ingredients.forEach(ingredient => {
    const li = document.createElement('li')
    li.textContent = `${ingredient.name}: ${ingredient.quantity} g — ${formatCurrency(ingredient.cost)}`
    selectors.previewIngredients.appendChild(li)
  })

  selectors.previewIngredientCost.textContent = formatCurrency(product.totals.baseCost)
  selectors.previewMarkup.textContent = `${product.markup}%`
  selectors.previewFinalPrice.textContent = formatCurrency(product.totals.finalPrice)
}

function clearSavedProducts() {
  if (!appState.savedProducts.length) return
  if (!confirm('¿Deseás vaciar todos los productos guardados?')) return

  appState.savedProducts = []
  appState.selectedProductId = null
  selectors.productsContainer.innerHTML = ''
  selectors.noProductsMessage.style.display = 'block'
  updatePreviewWithCurrentProduct()
}

function handleShare() {
  const product = appState.savedProducts.find(item => item.id === appState.selectedProductId)
  if (!product) {
    alert('Seleccioná un producto guardado para compartir el presupuesto.')
    return
  }

  const lines = []
  lines.push(`${appState.profile.name}`)
  lines.push(`${appState.profile.contact}`)
  lines.push('')
  lines.push(`Presupuesto: ${product.name}`)
  if (product.portions) {
    lines.push(`Cantidad: ${product.portions} unidades`)
  }
  if (product.notes) {
    lines.push(product.notes)
  }
  lines.push('')
  lines.push('Ingredientes:')
  product.ingredients.forEach(ingredient => {
    lines.push(`- ${ingredient.name}: ${ingredient.quantity} g (${formatCurrency(ingredient.cost)})`)
  })
  lines.push('')
  lines.push(`Costo ingredientes: ${formatCurrency(product.totals.baseCost)}`)
  lines.push(`Markup: ${product.markup}%`)
  lines.push(`Precio final: ${formatCurrency(product.totals.finalPrice)}`)

  const shareText = lines.join('\n')

  if (navigator.share) {
    navigator.share({
      title: `${product.name} · ${formatCurrency(product.totals.finalPrice)}`,
      text: shareText
    }).catch(() => {
      // ignorar cancelación
    })
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Presupuesto copiado al portapapeles. ¡Listo para pegar y enviar!')
    }, () => {
      alert('No se pudo copiar automáticamente. Copiá el siguiente texto:\n\n' + shareText)
    })
  } else {
    alert('Copiá el siguiente texto:\n\n' + shareText)
  }
}

function handlePrint() {
  window.print()
}

function attachEventListeners() {
  selectors.profileName.addEventListener('input', updateProfileState)
  selectors.profileContact.addEventListener('input', updateProfileState)
  selectors.profileLogo.addEventListener('change', handleLogoUpload)

  document.getElementById('ingredientForm').addEventListener('submit', addIngredient)

  selectors.productName.addEventListener('input', updatePreviewWithCurrentProduct)
  selectors.productNotes.addEventListener('input', updatePreviewWithCurrentProduct)
  selectors.productPortions.addEventListener('input', updatePreviewWithCurrentProduct)
  selectors.productMarkup.addEventListener('input', () => {
    if (selectors.productMarkup.value === '') return
    updatePreviewWithCurrentProduct()
  })

  selectors.saveProduct.addEventListener('click', saveCurrentProduct)
  selectors.clearProducts.addEventListener('click', clearSavedProducts)

  selectors.shareBudget.addEventListener('click', handleShare)
  selectors.printBudget.addEventListener('click', handlePrint)
}

function init() {
  renderProfile()
  renderIngredients()
  updateTotals()
  updatePreviewWithCurrentProduct()
  attachEventListeners()
}

window.addEventListener('DOMContentLoaded', init)
