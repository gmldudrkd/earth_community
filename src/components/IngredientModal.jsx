import { useState, useEffect } from 'react'
import { fetchIngredientsMaster, addCustomIngredient as saveCustomIngredient } from '../lib/ingredients'

const CUSTOM_CATEGORIES = [
  { key: 'SAFE_PLANT', label: '채소', labelEn: 'Vegetable', icon: 'spa', color: 'bg-primary/10 text-primary border-primary/30' },
  { key: 'EGG', label: '달걀', labelEn: 'Egg', icon: 'egg_alt', color: 'bg-amber-50 text-amber-600 border-amber-300' },
  { key: 'DAIRY', label: '유제품', labelEn: 'Dairy', icon: 'water_drop', color: 'bg-blue-50 text-blue-600 border-blue-300' },
]

const CATEGORY_COLORS = {
  SAFE_PLANT: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30', dot: 'bg-primary' },
  EGG: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-300', dot: 'bg-amber-500' },
  DAIRY: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-300', dot: 'bg-blue-500' },
  REVIEW: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', dot: 'bg-slate-400' },
}

export default function IngredientModal({ isOpen, onClose, selected, onConfirm, lang }) {
  const [search, setSearch] = useState('')
  const [localSelected, setLocalSelected] = useState([])
  const [masterData, setMasterData] = useState([])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState(null)

  const isKo = lang === 'ko'

  useEffect(() => {
    fetchIngredientsMaster()
      .then(setMasterData)
      .catch(() => {})
  }, [])

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

  const toggleIngredient = (ingredient) => {
    const exists = localSelected.some((s) => s.name === ingredient.name)
    if (exists) {
      setLocalSelected((prev) => prev.filter((s) => s.name !== ingredient.name))
    } else {
      setLocalSelected((prev) => [...prev, { name: ingredient.name, category: ingredient.category }])
    }
  }

  const isSelected = (name) => localSelected.some((s) => s.name === name)

  const clearAll = () => setLocalSelected([])

  // 검색어가 있을 때만 결과 표시
  const filtered = search.trim()
    ? masterData.filter((ing) => {
        const term = search.toLowerCase()
        return (
          ing.name.toLowerCase().includes(term) ||
          (ing.alias && ing.alias.toLowerCase().includes(term))
        )
      })
    : []

  const hasNoResults = search.trim() !== '' && filtered.length === 0

  const handleAddCustom = async () => {
    if (!customName.trim() || !customCategory) return

    try {
      await saveCustomIngredient(customName.trim(), customCategory)
    } catch {
      // upsert 실패해도 로컬 선택은 진행
    }

    setLocalSelected((prev) => [...prev, { name: customName.trim(), category: customCategory }])
    setMasterData((prev) => [
      ...prev,
      { id: Date.now(), name: customName.trim(), alias: null, category: customCategory },
    ])

    setCustomName('')
    setCustomCategory(null)
    setShowCustomInput(false)
    setSearch('')
  }

  const canConfirmCustom = customName.trim() !== '' && customCategory !== null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
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
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Chips */}
        {localSelected.length > 0 && !showCustomInput && (
          <div className="flex flex-wrap gap-1.5 px-5 pb-3">
            {localSelected.map((item) => {
              const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.REVIEW
              return (
                <button
                  key={item.name}
                  onClick={() => toggleIngredient(item)}
                  className={`flex h-8 items-center gap-1 rounded-full px-3 text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                >
                  {item.name}
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Ingredient List */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {!showCustomInput ? (
            <>
              {/* 검색 전 안내 */}
              {!search.trim() && (
                <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                  <span className="material-symbols-outlined text-3xl">search</span>
                  <p className="text-sm">{isKo ? '재료 이름을 검색해주세요' : 'Search for an ingredient'}</p>
                </div>
              )}

              {/* 검색 결과 */}
              {search.trim() && (
                <div className="flex flex-wrap gap-2">
                  {filtered.map((ing) => {
                    const sel = isSelected(ing.name)
                    const colors = CATEGORY_COLORS[ing.category] || CATEGORY_COLORS.REVIEW
                    return (
                      <button
                        key={ing.id}
                        onClick={() => toggleIngredient(ing)}
                        className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-all ${
                          sel
                            ? `${colors.bg} ${colors.text} border ${colors.border}`
                            : 'bg-slate-50 text-slate-700 border border-transparent hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sel ? colors.dot : 'bg-slate-300'}`} />
                        {ing.name}
                        {ing.alias && (
                          <span className="text-[10px] text-slate-400 ml-0.5">({ing.alias})</span>
                        )}
                        {sel && (
                          <span className="material-symbols-outlined text-sm ml-0.5">check</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

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

              {/* 직접 입력 버튼 */}
              <div className="mt-3">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-1.5 text-slate-400 text-xs font-medium hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  {isKo ? '목록에 없는 재료 직접 입력' : 'Add unlisted ingredient'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-5 py-2">
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

              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold">
                  {isKo ? '분류 선택' : 'Select Category'}
                </label>
                <div className="flex gap-2">
                  {CUSTOM_CATEGORIES.map((cat) => {
                    const isActive = customCategory === cat.key
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setCustomCategory(isActive ? null : cat.key)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all border-2 ${
                          isActive
                            ? cat.color
                            : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-2xl ${
                          isActive ? '' : 'text-slate-400'
                        }`}>
                          {cat.icon}
                        </span>
                        {isKo ? cat.label : cat.labelEn}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleAddCustom}
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
                  setCustomName('')
                  setCustomCategory(null)
                }}
                className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
              >
                {isKo ? '← 목록으로 돌아가기' : '← Back to list'}
              </button>
            </div>
          )}
        </div>

        {/* Confirm */}
        {!showCustomInput && (
          <div className="p-5 pt-0">
            {localSelected.some((s) => s.category && s.category !== 'SAFE_PLANT') && (
              <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-500 text-lg shrink-0 mt-0.5">info</span>
                <p className="text-xs text-amber-700">
                  {isKo
                    ? '비식물성 재료가 포함되어 있어 "완전 식물성" 레시피로 분류되지 않습니다.'
                    : 'Contains non-plant ingredients. This recipe will not be classified as 100% plant-based.'}
                </p>
              </div>
            )}
            <button
              onClick={() => {
                onConfirm(localSelected)
                onClose()
              }}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isKo ? `선택 완료 (${localSelected.length})` : `Confirm (${localSelected.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
