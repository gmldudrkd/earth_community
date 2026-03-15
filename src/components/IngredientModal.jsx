import { useState, useEffect } from 'react'

const COMMON_INGREDIENTS = [
  { key: 'milk', label: 'Milk', labelKo: '우유' },
  { key: 'cheese', label: 'Cheese', labelKo: '치즈' },
  { key: 'egg', label: 'Egg', labelKo: '달걀' },
  { key: 'fish', label: 'Fish', labelKo: '생선' },
  { key: 'meat', label: 'Meat', labelKo: '고기' },
  { key: 'honey', label: 'Honey', labelKo: '꿀' },
  { key: 'fruit', label: 'Fruit', labelKo: '과일' },
  { key: 'nut', label: 'Nut', labelKo: '견과류' },
]

const CATEGORIES = [
  { key: 'vegetable', label: 'Vegetable', labelKo: '채소', icon: 'spa' },
  { key: 'egg', label: 'Egg', labelKo: '달걀', icon: 'egg_alt' },
  { key: 'dairy', label: 'Dairy', labelKo: '유제품', icon: 'water_drop' },
  { key: 'animal', label: 'Meat/Fish', labelKo: '소/돼지/생선', icon: 'kebab_dining' },
]

export default function IngredientModal({ isOpen, onClose, selected, onConfirm, lang }) {
  const [search, setSearch] = useState('')
  const [localSelected, setLocalSelected] = useState(selected || [])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setLocalSelected(selected || [])
      setSearch('')
      setShowCustomInput(false)
      setCustomName('')
      setCustomCategory(null)
    }
  }, [isOpen, selected])

  if (!isOpen) return null

  const isKo = lang === 'ko'

  const toggleIngredient = (key) => {
    setLocalSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const clearAll = () => setLocalSelected([])

  const filtered = COMMON_INGREDIENTS.filter((ing) => {
    const term = search.toLowerCase()
    return ing.label.toLowerCase().includes(term) || ing.labelKo.includes(term)
  })

  const hasNoResults = search.trim() !== '' && filtered.length === 0

  const isAnimalSelected = customCategory === 'animal'
  const canConfirmCustom = customName.trim() !== '' && customCategory && !isAnimalSelected

  const addCustomIngredient = () => {
    if (!canConfirmCustom) return
    const custom = { name: customName.trim(), category: customCategory }
    setLocalSelected((prev) => [...prev, custom])
    setCustomName('')
    setCustomCategory(null)
    setShowCustomInput(false)
    setSearch('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-100">
          <button onClick={onClose} className="text-slate-900">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <h2 className="text-lg font-bold text-slate-900">
            {isKo ? '재료 선택' : 'Select Ingredients'}
          </h2>
          <button
            onClick={clearAll}
            className="text-primary text-sm font-bold hover:opacity-80 transition-opacity"
          >
            {isKo ? '초기화' : 'Clear'}
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <div className="flex items-center rounded-xl bg-slate-100 px-4 py-3">
            <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
            <input
              className="w-full border-none bg-transparent focus:ring-0 text-slate-900 placeholder:text-slate-400 ml-2 text-sm outline-none"
              placeholder={isKo ? '재료 검색...' : 'Search ingredients...'}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setShowCustomInput(false)
                setCustomCategory(null)
              }}
            />
          </div>
        </div>

        {/* Ingredient Chips or Custom Input */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {!showCustomInput ? (
            <>
              <div className="flex flex-wrap gap-2">
                {filtered.map((ing) => {
                  const isSelected = localSelected.includes(ing.key)
                  return (
                    <button
                      key={ing.key}
                      onClick={() => toggleIngredient(ing.key)}
                      className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : 'bg-slate-100 text-slate-700 border border-transparent hover:bg-slate-200'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-base ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                        {isSelected ? 'check_circle' : 'add_circle'}
                      </span>
                      {isKo ? ing.labelKo : ing.label}
                    </button>
                  )
                })}
              </div>

              {/* No results -> show custom input button */}
              {hasNoResults && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <p className="text-slate-400 text-sm">
                    {isKo ? `"${search}" 검색 결과가 없습니다` : `No results for "${search}"`}
                  </p>
                  <button
                    onClick={() => {
                      setShowCustomInput(true)
                      setCustomName(search)
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    {isKo ? '직접 입력' : 'Add manually'}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Custom Input Form */
            <div className="flex flex-col gap-5 py-2">
              {/* Name Input */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold">
                  {isKo ? '재료 이름' : 'Ingredient Name'}
                </label>
                <input
                  className="w-full rounded-full border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-primary h-12 px-5 text-sm outline-none"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={isKo ? '재료 이름 입력' : 'Enter ingredient name'}
                  autoFocus
                />
              </div>

              {/* Category Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold">
                  {isKo ? '분류 선택' : 'Select Category'}
                </label>
                <div className="flex gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = customCategory === cat.key
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setCustomCategory(isActive ? null : cat.key)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? cat.key === 'animal'
                              ? 'bg-red-50 text-red-500 border-2 border-red-300'
                              : 'bg-primary/10 text-primary border-2 border-primary/30'
                            : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-2xl ${
                          isActive
                            ? cat.key === 'animal' ? 'text-red-500' : 'text-primary'
                            : 'text-slate-400'
                        }`}>
                          {cat.icon}
                        </span>
                        {isKo ? cat.labelKo : cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Animal Warning */}
              {isAnimalSelected && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-red-500 text-lg">warning</span>
                    <span className="text-sm font-bold text-red-600">
                      {isKo ? '등록 불가' : 'Not Allowed'}
                    </span>
                  </div>
                  <p className="text-xs text-red-500 leading-relaxed">
                    {isKo
                      ? '동물 자체는 지양하는 식재료예요. 동물 자체를 먹는 것은 최대한 피하고, 건강과 지속가능성을 고려해 계란·우유·꿀 같은 일부 부산물만 허용하고 있어요.'
                      : 'We avoid using whole animals as ingredients. We encourage minimizing direct animal consumption and only allow certain by-products like eggs, milk, and honey for health and sustainability.'}
                  </p>
                </div>
              )}

              {/* Custom OK Button */}
              <button
                onClick={addCustomIngredient}
                disabled={!canConfirmCustom}
                className={`w-full font-bold py-3.5 rounded-full transition-all text-sm ${
                  canConfirmCustom
                    ? 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-lg shadow-primary/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                OK
              </button>

              <button
                onClick={() => {
                  setShowCustomInput(false)
                  setCustomCategory(null)
                }}
                className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
              >
                {isKo ? '← 목록으로 돌아가기' : '← Back to list'}
              </button>
            </div>
          )}
        </div>

        {/* Confirm Button */}
        {!showCustomInput && (
          <div className="p-5 pt-0">
            <button
              onClick={() => {
                onConfirm(localSelected)
                onClose()
              }}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isKo ? '선택 완료' : 'Confirm Selection'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
