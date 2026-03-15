import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import IngredientModal from '../components/IngredientModal'
import { createRecipe } from '../lib/recipes'
import { determineVeganStatus, getNonPlantCategories } from '../lib/ingredients'
import { uploadMainImage, uploadStepImage } from '../lib/storage'

const UNITS = ['g', 'kg', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'pcs']

const CATEGORY_OPTIONS = [
  { key: 'all', labelKo: '전체', labelEn: 'All' },
  { key: 'breakfast', labelKo: '아침', labelEn: 'Breakfast' },
  { key: 'lunch', labelKo: '점심', labelEn: 'Lunch' },
  { key: 'dinner', labelKo: '저녁', labelEn: 'Dinner' },
  { key: 'snack', labelKo: '간식', labelEn: 'Snack' },
]

const CATEGORY_BADGE = {
  EGG: { labelKo: '달걀 포함', labelEn: 'Contains Egg', icon: 'egg_alt', color: 'text-amber-600 bg-amber-50' },
  DAIRY: { labelKo: '유제품 포함', labelEn: 'Contains Dairy', icon: 'water_drop', color: 'text-blue-600 bg-blue-50' },
  ANIMAL: { labelKo: '동물성 포함', labelEn: 'Contains Animal', icon: 'kebab_dining', color: 'text-red-500 bg-red-50' },
  REVIEW: { labelKo: '확인 필요', labelEn: 'Review Needed', icon: 'help', color: 'text-slate-600 bg-slate-100' },
}

export default function AddRecipe() {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const isKo = lang === 'ko'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('')
  const [servings, setServings] = useState('')
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState(1)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [saving, setSaving] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')

  // 이미지 상태
  const [mainImage, setMainImage] = useState(null)
  const [mainImagePreview, setMainImagePreview] = useState(null)
  const mainImageRef = useRef(null)

  // ingredients: [{name, category, amount?, unit?}]
  const [ingredients, setIngredients] = useState([])
  const [amounts, setAmounts] = useState({})
  const [showIngredientModal, setShowIngredientModal] = useState(false)

  const stepImageRefs = useRef({})
  const difficultyLabels = t.recipeList.difficultyLabels

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMainImage(file)
    setMainImagePreview(URL.createObjectURL(file))
  }

  const removeMainImage = () => {
    setMainImage(null)
    setMainImagePreview(null)
    if (mainImageRef.current) mainImageRef.current.value = ''
  }

  const handleStepImageChange = (index, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, imageFile: file, imagePreview: URL.createObjectURL(file) } : s
      )
    )
  }

  const removeStepImage = (index) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, imageFile: null, imagePreview: null } : s
      )
    )
    if (stepImageRefs.current[index]) stepImageRefs.current[index].value = ''
  }

  // 재료 기반 vegan 자동 판별
  const isVegan = useMemo(() => determineVeganStatus(ingredients, {}), [ingredients])
  const nonPlantCategories = useMemo(() => getNonPlantCategories(ingredients, {}), [ingredients])

  const handleConfirmIngredients = (selected) => {
    // selected: [{name, category}]
    setIngredients(selected)
    setAmounts((prev) => {
      const next = { ...prev }
      selected.forEach((item) => {
        if (!next[item.name]) next[item.name] = { amount: '', unit: 'g' }
      })
      Object.keys(next).forEach((k) => {
        if (!selected.some((item) => item.name === k)) delete next[k]
      })
      return next
    })
  }

  const updateAmount = (name, value) => {
    setAmounts((prev) => ({ ...prev, [name]: { ...prev[name], amount: value } }))
  }

  const updateUnit = (name, value) => {
    setAmounts((prev) => ({ ...prev, [name]: { ...prev[name], unit: value } }))
  }

  const removeIngredient = (name) => {
    setIngredients((prev) => prev.filter((i) => i.name !== name))
    setAmounts((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const [steps, setSteps] = useState([{ text: '', imageFile: null, imagePreview: null }])
  const addStep = () => setSteps((prev) => [...prev, { text: '', imageFile: null, imagePreview: null }])
  const removeStep = (index) => setSteps((prev) => prev.filter((_, i) => i !== index))
  const updateStep = (index, text) =>
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, text } : s)))

  const handlePasswordChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 6)
    setPassword(digits)
    setPasswordError('')
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setValidationMessage(isKo ? '레시피 제목을 입력해주세요.' : 'Please enter a recipe title.')
      return
    }
    if (!prepTimeMinutes) {
      setValidationMessage(isKo ? '조리 시간을 입력해주세요.' : 'Please enter prep time.')
      return
    }
    if (!servings.trim()) {
      setValidationMessage(isKo ? '인분을 입력해주세요.' : 'Please enter servings.')
      return
    }
    if (ingredients.length === 0) {
      setValidationMessage(isKo ? '재료를 1개 이상 추가해주세요.' : 'Please add at least one ingredient.')
      return
    }
    if (!steps.some((s) => s.text.trim())) {
      setValidationMessage(isKo ? '조리 순서를 1단계 이상 입력해주세요.' : 'Please add at least one step.')
      return
    }
    if (password.length !== 6) {
      setValidationMessage(isKo ? '관리 비밀번호 6자리를 입력해주세요.' : 'Please enter a 6-digit password.')
      return
    }

    setSaving(true)
    try {
      const ingredientList = ingredients.map((item) => {
        const info = amounts[item.name] || { amount: '', unit: '' }
        return { name: item.name, amount: `${info.amount}${info.unit}`, category: item.category }
      })

      // 메인 이미지 업로드
      let imageUrl = null
      if (mainImage) {
        imageUrl = await uploadMainImage(mainImage)
      }

      // 단계별 이미지 업로드 + step 데이터 구성
      const stepList = await Promise.all(
        steps
          .filter((s) => s.text.trim())
          .map(async (s, i) => {
            if (s.imageFile) {
              const stepImageUrl = await uploadStepImage(s.imageFile, i)
              return { text: s.text, image_url: stepImageUrl }
            }
            return s.text
          })
      )

      await createRecipe({
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl,
        prep_time: prepTimeMinutes ? `${prepTimeMinutes}${isKo ? '분' : ' min'}` : null,
        prep_time_minutes: prepTimeMinutes ? Number(prepTimeMinutes) : null,
        servings: servings.trim() || null,
        category,
        vegan: isVegan,
        difficulty,
        ingredients: ingredientList,
        steps: stepList,
        password,
      })

      navigate('/recipes')
    } catch (err) {
      console.error('Failed to save recipe:', err)
      setValidationMessage(isKo ? '저장 중 오류가 발생했습니다.' : 'An error occurred while saving.')
    } finally {
      setSaving(false)
    }
  }

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
          <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 flex-1 text-center pr-12">
            {isKo ? '새 레시피 추가' : 'Add New Recipe'}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto lg:py-10">
            {/* Media Upload */}
            <input
              ref={mainImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMainImageChange}
            />
            {mainImagePreview ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <img
                  src={mainImagePreview}
                  alt="Main preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={removeMainImage}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
                <button
                  onClick={() => mainImageRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white/90 text-slate-700 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-white transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  {isKo ? '변경' : 'Change'}
                </button>
              </div>
            ) : (
              <div
                onClick={() => mainImageRef.current?.click()}
                className="w-full aspect-video rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors"
              >
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">add_a_photo</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  {isKo ? '메인 이미지 등록' : 'Add main image'}
                </p>
              </div>
            )}

            {/* Recipe Title */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 text-sm font-semibold px-1">
                {isKo ? '레시피 제목' : 'Recipe Title'}
                <span className="text-red-400 ml-0.5">*</span>
              </label>
              <input
                className="w-full rounded-full border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-primary h-14 px-6 text-base outline-none"
                placeholder={isKo ? '예) 상큼한 애호박 샐러드' : 'e.g. Refreshing Zucchini Salad'}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold px-1">
                  {isKo ? '카테고리' : 'Category'}
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-full border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-primary h-12 px-6 text-sm outline-none appearance-none cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {isKo ? cat.labelKo : cat.labelEn}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold px-1 flex items-center gap-1.5">
                  {isKo ? '난이도' : 'Difficulty'}
                  <span className="text-xs font-normal text-slate-400">{difficultyLabels[difficulty]}</span>
                </label>
                <div className="flex items-center h-12 gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <span className={`material-symbols-outlined text-2xl ${
                        level <= difficulty ? 'text-primary' : 'text-slate-200'
                      }`}>
                        potted_plant
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Prep Time & Servings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 text-sm font-semibold px-1">
                  {isKo ? '조리 시간 (분)' : 'Prep Time (min)'}
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-full border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-primary h-12 px-6 text-sm outline-none"
                    placeholder="15"
                    type="number"
                    min="1"
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(e.target.value)}
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
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
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
                {/* 식물성 여부 자동 표시 */}
                {ingredients.length > 0 && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isVegan
                      ? 'bg-primary/10 text-primary'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    <span className="material-symbols-outlined text-sm">
                      {isVegan ? 'spa' : 'info'}
                    </span>
                    {isVegan
                      ? (isKo ? '완전 식물성' : '100% Plant')
                      : (isKo ? '비식물성 포함' : 'Non-plant included')}
                  </span>
                )}
              </div>

              {/* 비식물성 카테고리 뱃지 */}
              {nonPlantCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-1">
                  {nonPlantCategories.map((cat) => {
                    const badge = CATEGORY_BADGE[cat]
                    if (!badge) return null
                    return (
                      <span
                        key={cat}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${badge.color}`}
                      >
                        <span className="material-symbols-outlined text-xs">{badge.icon}</span>
                        {isKo ? badge.labelKo : badge.labelEn}
                      </span>
                    )
                  })}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {ingredients.map((item) => {
                  const info = amounts[item.name] || { amount: '', unit: 'g' }
                  const colors = {
                    SAFE_PLANT: 'bg-primary',
                    EGG: 'bg-amber-500',
                    DAIRY: 'bg-blue-500',
                    ANIMAL: 'bg-red-500',
                    REVIEW: 'bg-slate-400',
                  }
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors[item.category] || 'bg-slate-400'}`} />
                        <span className="text-slate-900 font-semibold text-base">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={info.amount}
                            onChange={(e) => updateAmount(item.name, e.target.value)}
                            placeholder="0"
                            className="w-12 h-9 text-center text-sm font-medium text-primary border-none bg-transparent outline-none focus:ring-0"
                          />
                          <select
                            value={info.unit}
                            onChange={(e) => updateUnit(item.name, e.target.value)}
                            className="h-9 text-sm font-medium text-slate-500 border-none bg-transparent outline-none focus:ring-0 pr-2 cursor-pointer appearance-none"
                          >
                            {UNITS.map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => removeIngredient(item.name)}
                          className="text-slate-300 hover:text-red-400 transition-colors ml-1"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

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
                  <input
                    ref={(el) => { stepImageRefs.current[i] = el }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleStepImageChange(i, e)}
                  />
                  {step.imagePreview ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                      <img
                        src={step.imagePreview}
                        alt={`Step ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeStepImage(i)}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => stepImageRefs.current[i]?.click()}
                      className="w-full aspect-video rounded-lg bg-white border border-slate-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-slate-400">add_photo_alternate</span>
                      <span className="text-slate-400 text-xs font-medium">
                        {isKo ? '단계 사진 추가' : 'Add step photo'}
                      </span>
                    </div>
                  )}
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

            {/* 6-digit Password - 맨 아래 */}
            <div className="flex flex-col gap-2 mt-4 pt-6 border-t border-slate-100">
              <label className="text-slate-900 text-sm font-semibold px-1">
                {isKo ? '관리 비밀번호 (숫자 6자리)' : 'Management Password (6 digits)'}
                <span className="text-red-400 ml-0.5">*</span>
              </label>
              <p className="text-slate-400 text-xs px-1">
                {isKo
                  ? '레시피 수정/삭제 요청 시 필요합니다.'
                  : 'Required when requesting recipe edit/delete.'}
              </p>
              <input
                className={`w-full rounded-full border bg-white text-slate-900 focus:ring-primary h-14 px-6 text-base outline-none tracking-[0.5em] text-center font-mono ${
                  passwordError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-primary'
                }`}
                placeholder="000000"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              {passwordError && (
                <p className="text-red-500 text-xs px-1">{passwordError}</p>
              )}
              <div className="flex gap-1 justify-center mt-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i < password.length ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Sticky Bottom Save Button */}
        <div className="mt-auto p-6 pb-10 bg-gradient-to-t from-white via-white to-transparent max-w-3xl mx-auto w-full">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving
              ? (isKo ? '저장 중...' : 'Saving...')
              : (isKo ? '레시피 저장' : 'Save Recipe')}
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

      {/* Validation Modal */}
      {validationMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setValidationMessage('')} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 mx-6 max-w-sm w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-500 text-2xl">warning</span>
              </div>
              <p className="text-slate-900 text-sm font-medium text-center">{validationMessage}</p>
              <button
                onClick={() => setValidationMessage('')}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-full transition-all active:scale-[0.98]"
              >
                {isKo ? '확인' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
