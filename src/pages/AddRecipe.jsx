import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import IngredientModal from '../components/IngredientModal'

const INGREDIENT_MAP = {
  milk: { label: 'Milk', labelKo: '우유' },
  cheese: { label: 'Cheese', labelKo: '치즈' },
  egg: { label: 'Egg', labelKo: '달걀' },
  fish: { label: 'Fish', labelKo: '생선' },
  meat: { label: 'Meat', labelKo: '고기' },
  honey: { label: 'Honey', labelKo: '꿀' },
  fruit: { label: 'Fruit', labelKo: '과일' },
  nut: { label: 'Nut', labelKo: '견과류' },
}

const UNITS = ['g', 'kg', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'pcs']

function getIngredientLabel(item, isKo) {
  if (typeof item === 'object' && item.name) return item.name
  return isKo ? INGREDIENT_MAP[item]?.labelKo : INGREDIENT_MAP[item]?.label
}

function getIngredientKey(item) {
  return typeof item === 'object' ? `custom-${item.name}` : item
}

export default function AddRecipe() {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const isKo = lang === 'ko'

  const [ingredients, setIngredients] = useState([])     // raw keys/objects from modal
  const [amounts, setAmounts] = useState({})              // { key: { amount, unit } }
  const [showIngredientModal, setShowIngredientModal] = useState(false)

  const handleConfirmIngredients = (selected) => {
    setIngredients(selected)
    // initialize amounts for new ingredients
    setAmounts((prev) => {
      const next = { ...prev }
      selected.forEach((item) => {
        const k = getIngredientKey(item)
        if (!next[k]) next[k] = { amount: '', unit: 'g' }
      })
      // remove amounts for deselected ingredients
      Object.keys(next).forEach((k) => {
        if (!selected.some((item) => getIngredientKey(item) === k)) delete next[k]
      })
      return next
    })
  }

  const updateAmount = (key, value) => {
    setAmounts((prev) => ({ ...prev, [key]: { ...prev[key], amount: value } }))
  }

  const updateUnit = (key, value) => {
    setAmounts((prev) => ({ ...prev, [key]: { ...prev[key], unit: value } }))
  }

  const removeIngredient = (item) => {
    const k = getIngredientKey(item)
    setIngredients((prev) => prev.filter((i) => i !== item))
    setAmounts((prev) => {
      const next = { ...prev }
      delete next[k]
      return next
    })
  }
  const [steps, setSteps] = useState([{ text: '' }])

  const addStep = () => setSteps((prev) => [...prev, { text: '' }])
  const removeStep = (index) => setSteps((prev) => prev.filter((_, i) => i !== index))
  const updateStep = (index, text) =>
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, text } : s)))

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white">
        {/* Top Navigation Bar */}
        <div className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-100">
          <button
            onClick={() => navigate('/recipes')}
            className="text-slate-900 flex size-12 shrink-0 items-center justify-start"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 flex-1 text-center">
            {isKo ? '새 레시피 추가' : 'Add New Recipe'}
          </h2>
          <div className="flex w-12 items-center justify-end">
            <button className="text-primary text-base font-bold leading-normal tracking-wide hover:opacity-80 transition-opacity">
              {isKo ? '게시' : 'Post'}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 p-6">
            {/* Media Upload */}
            <div className="w-full aspect-video rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">add_a_photo</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                {isKo ? '메인 이미지 등록' : 'Add main image'}
              </p>
            </div>

            {/* Recipe Title */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 text-sm font-semibold px-1">
                {isKo ? '레시피 제목' : 'Recipe Title'}
              </label>
              <input
                className="w-full rounded-full border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-primary h-14 px-6 text-base outline-none"
                placeholder={isKo ? '예) 상큼한 애호박 샐러드' : 'e.g. Refreshing Zucchini Salad'}
                type="text"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <label className="text-slate-900 text-sm font-semibold">
                  {isKo ? '설명' : 'Description'}
                </label>
                <span className="text-slate-400 text-xs font-medium">option</span>
              </div>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-primary min-h-[100px] p-6 text-base resize-none outline-none"
                placeholder={isKo ? '이 한 끼에 담긴 이야기를 공유해주세요...' : 'Share the story behind this light meal...'}
              />
            </div>

            {/* Prep Time & Servings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold px-1">
                  {isKo ? '조리 시간' : 'Prep Time'}
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-full border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-primary h-12 px-6 text-sm outline-none"
                    placeholder={isKo ? '15분' : '15 min'}
                    type="text"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">schedule</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold px-1">
                  {isKo ? '인분' : 'Servings'}
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-full border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-primary h-12 px-6 text-sm outline-none"
                    placeholder={isKo ? '2인분' : '2 people'}
                    type="text"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">group</span>
                </div>
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-slate-900 text-sm font-semibold">
                  {isKo ? '재료' : 'Ingredients'}
                </label>
              </div>

              {/* Ingredient List with Amount */}
              <div className="flex flex-col gap-3">
                {ingredients.map((item) => {
                  const label = getIngredientLabel(item, isKo)
                  if (!label) return null
                  const key = getIngredientKey(item)
                  const info = amounts[key] || { amount: '', unit: 'g' }
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                        <span className="text-slate-900 font-semibold text-base">{label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={info.amount}
                            onChange={(e) => updateAmount(key, e.target.value)}
                            placeholder="0"
                            className="w-12 h-9 text-center text-sm font-medium text-primary border-none bg-transparent outline-none focus:ring-0"
                          />
                          <select
                            value={info.unit}
                            onChange={(e) => updateUnit(key, e.target.value)}
                            className="h-9 text-sm font-medium text-slate-500 border-none bg-transparent outline-none focus:ring-0 pr-2 cursor-pointer appearance-none"
                          >
                            {UNITS.map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => removeIngredient(item)}
                          className="text-slate-300 hover:text-red-400 transition-colors ml-1"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Add Ingredient Button */}
              <button
                onClick={() => setShowIngredientModal(true)}
                className="w-full py-3 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-slate-500 font-medium hover:border-primary hover:text-primary transition-all text-sm"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                {isKo ? '재료 추가' : 'Add Ingredient'}
              </button>
            </div>

            {/* Instructions */}
            <div className="flex flex-col gap-4">
              <label className="text-slate-900 text-sm font-semibold px-1">
                {isKo ? '조리 순서' : 'Instructions'}
              </label>
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col gap-4 p-5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shadow-sm">
                      {i + 1}
                    </div>
                    <span className="text-slate-900 font-bold text-sm">
                      {isKo ? `단계 ${i + 1}` : `Step ${i + 1}`}
                    </span>
                    {steps.length > 1 && (
                      <div className="ml-auto">
                        <button
                          onClick={() => removeStep(i)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="w-full aspect-video rounded-lg bg-white border border-slate-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                    <span className="material-symbols-outlined text-slate-400">add_photo_alternate</span>
                    <span className="text-slate-400 text-xs font-medium">
                      {isKo ? '단계 사진 추가' : 'Add step photo'}
                    </span>
                  </div>
                  <textarea
                    className="w-full rounded-lg border-transparent bg-white text-slate-900 focus:border-primary focus:ring-primary min-h-[80px] p-4 text-sm resize-none outline-none"
                    placeholder={isKo ? '이 단계를 설명해주세요...' : 'Describe this step...'}
                    value={step.text}
                    onChange={(e) => updateStep(i, e.target.value)}
                  />
                </div>
              ))}
              <button
                onClick={addStep}
                className="w-full py-4 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-slate-500 font-semibold hover:border-primary hover:text-primary transition-all group"
              >
                <span className="material-symbols-outlined text-xl transition-transform group-hover:scale-110">add_circle</span>
                {isKo ? '다음 단계 추가' : 'Add Next Step'}
              </button>
            </div>

          </div>
        </div>

        {/* Sticky Bottom Save Button */}
        <div className="mt-auto p-6 pb-10 bg-gradient-to-t from-white via-white to-transparent">
          <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
            {isKo ? '레시피 저장' : 'Save Recipe'}
          </button>
        </div>
      </div>

      {/* Ingredient Modal */}
      <IngredientModal
        isOpen={showIngredientModal}
        onClose={() => setShowIngredientModal(false)}
        selected={ingredients}
        onConfirm={handleConfirmIngredients}
        lang={lang}
      />
    </>
  )
}
