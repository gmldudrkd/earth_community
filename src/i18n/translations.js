export const translations = {
  en: {
    // Common
    appName: 'OMG Table',
    // Bottom Nav
    nav: { home: 'Home', recipe: 'Recipe', about: 'About' },
    // Home
    home: {
      hero: {
        before: 'Better than a ',
        highlight: 'perfect vegan',
        after: ', a pleasant plant-based meal.',
      },
      search: 'Search recipes, ingredients...',
      curatedPicks: 'Curated Picks',
      seeAll: 'See all',
      categories: 'Categories',
      recipes: [
        { title: 'Creamy Avocado Toast', time: '15 mins', tag: 'Easy' },
        { title: 'Rainbow Buddha Bowl', time: '25 mins', tag: 'High Protein' },
        { title: 'Mediterranean Quinoa', time: '20 mins', tag: 'Fresh' },
      ],
      categoryList: [
        { label: 'Breakfast' },
        { label: 'Lunch' },
        { label: 'Dinner' },
        { label: 'Snack' },
      ],
      starterGuide: 'Quick Starter Guide',
      starterSteps: [
        { title: 'Explore recipes', desc: 'Browse our curated selection of easy meals.' },
        { title: "Cook with what's in your fridge", desc: 'Use our search filters to find recipes for your ingredients.' },
        { title: 'Share your joy', desc: 'Upload your results and inspire our community.' },
      ],
    },
    // Recipe List
    recipeList: {
      subtitle: 'Healthy cooking made simple',
      searchPlaceholder: 'Search healthy recipes',
      filters: [
        { label: '100% Plant', icon: 'spa', key: 'vegan' },
        { label: 'Egg/Dairy OK', icon: 'egg_alt', key: 'dairy-ok' },
        { label: 'Under 15 min', icon: 'timer', key: 'quick' },
        { label: 'Beginner', icon: 'potted_plant', key: 'beginner' },
      ],
      difficultyLabels: ['', 'Very Easy', 'Easy', 'Normal', 'Hard', 'Very Hard'],
      sortByDate: 'Latest',
      sortByLikes: 'Most Liked',
      noResults: 'No recipes found. Try different keywords or filters.',
      recipes: [
        { title: 'Crispy Tofu Stir-fry', time: '20 min', difficulty: 3, vegan: true },
        { title: 'Pesto Whole Grain Pasta', time: '15 min', difficulty: 2, vegan: true },
        { title: 'Spring Green Salad', time: '10 min', difficulty: 1, vegan: true },
      ],
    },
    // Recipe Detail
    recipeDetail: {
      title: 'Avocado & Poached Egg Toast',
      description: 'A high-protein breakfast that stays fresh and light. Perfect for starting a productive day.',
      time: '15 min',
      difficulty: 2,
      difficultyLabels: ['', 'Very Easy', 'Easy', 'Normal', 'Hard', 'Very Hard'],
      timeLabel: 'Time',
      difficultyLabel: 'Difficulty',
      ingredients: 'Ingredients',
      servings: '2 Servings',
      instructions: 'Instructions',
      ingredientList: [
        { name: 'Ripe Avocado', amount: '1 unit' },
        { name: 'Organic Eggs', amount: '2 units' },
        { name: 'Sourdough Bread', amount: '2 slices', tip: 'Use gluten-free bread or sweet potato slices for a lighter alternative.' },
        { name: 'Sea Salt & Black Pepper', amount: 'to taste' },
        { name: 'Lime Juice', amount: '1 squeeze' },
      ],
      tipLabel: 'Substitution Tip',
      steps: [
        { text: 'Toast the sourdough slices until golden brown and crispy on the edges.' },
        { text: 'Mash the avocado with a pinch of sea salt, black pepper, and a squeeze of lime juice.' },
        { text: 'Poach the eggs in simmering water with a drop of vinegar for exactly 3 minutes.' },
        { text: 'Spread the mashed avocado on the toast, place the poached egg on top, and season with salt and pepper.' },
      ],
    },
    // About
    about: {
      header: 'Our Story',
      heroText: 'Why OMG Table? Because a single pleasant meal creates more change than a perfect lifestyle.',
      whyTitle: 'No guilt, no pressure.',
      whyDesc: 'Just a delicious plant-based choice for your day.',
      principles: [
        { title: 'No Pressure', desc: "We don't demand you to be a 100% vegan. Every plant-based bite counts." },
        { title: 'Easy & Delicious', desc: 'Taste and simplicity come first. Cooking should be the highlight of your day.' },
        { title: 'Sustainable Joy', desc: 'Small habits make a big difference for the planet and yourself.' },
      ],
    },
  },
  ko: {
    // Common
    appName: 'OMG Table',
    // Bottom Nav
    nav: { home: 'Home', recipe: 'Recipe', about: 'About' },
    // Home
    home: {
      hero: {
        before: '',
        highlight: '완벽한 비건',
        after: '보다,\n기분 좋은 식물성 한 끼.',
      },
      search: '레시피, 재료 검색...',
      curatedPicks: 'Curated Picks',
      seeAll: '전체보기',
      categories: '카테고리',
      recipes: [
        { title: '크리미 아보카도 토스트', time: '15분', tag: '쉬움' },
        { title: '레인보우 부다 보울', time: '25분', tag: '고단백' },
        { title: '지중해식 퀴노아', time: '20분', tag: '신선함' },
      ],
      categoryList: [
        { label: '아침' },
        { label: '점심' },
        { label: '저녁' },
        { label: '간식' },
      ],
      starterGuide: '시작 가이드',
      starterSteps: [
        { title: '레시피 둘러보기', desc: '쉽고 맛있는 레시피를 만나보세요.' },
        { title: '냉장고 속 재료로 요리하기', desc: '검색 필터로 가진 재료에 맞는 레시피를 찾아보세요.' },
        { title: '나만의 레시피 공유하기', desc: '요리 결과를 업로드하고 커뮤니티에 영감을 주세요.' },
      ],
    },
    // Recipe List
    recipeList: {
      subtitle: '쉽고 건강한 요리',
      searchPlaceholder: '건강한 레시피 검색',
      filters: [
        { label: '완전 식물성', icon: 'spa', key: 'vegan' },
        { label: '달걀/유제품 먹어요', icon: 'egg_alt', key: 'dairy-ok' },
        { label: '15분 이내 요리', icon: 'timer', key: 'quick' },
        { label: '초보용', icon: 'potted_plant', key: 'beginner' },
      ],
      difficultyLabels: ['', '아주 쉬움', '쉬움', '보통', '어려움', '매우 어려움'],
      sortByDate: '최신순',
      sortByLikes: '좋아요순',
      noResults: '레시피를 찾을 수 없습니다. 다른 키워드나 필터를 시도해보세요.',
      recipes: [
        { title: '바삭 두부 볶음', time: '20분', difficulty: 3, vegan: true },
        { title: '페스토 통곡물 파스타', time: '15분', difficulty: 2, vegan: true },
        { title: '봄나물 그린 샐러드', time: '10분', difficulty: 1, vegan: true },
      ],
    },
    // Recipe Detail
    recipeDetail: {
      title: '아보카도 & 수란 토스트',
      description: '신선하고 가벼운 고단백 아침 식사. 활기찬 하루를 시작하기에 완벽합니다.',
      time: '15분',
      difficulty: 2,
      difficultyLabels: ['', '아주 쉬움', '쉬움', '보통', '어려움', '매우 어려움'],
      timeLabel: '시간',
      difficultyLabel: '난이도',
      ingredients: '재료',
      servings: '2인분',
      instructions: '조리 순서',
      ingredientList: [
        { name: '잘 익은 아보카도', amount: '1개' },
        { name: '유기농 달걀', amount: '2개' },
        { name: '사워도우 빵', amount: '2장', tip: '글루텐프리 빵이나 고구마 슬라이스로 대체할 수 있어요.' },
        { name: '소금 & 후추', amount: '적당량' },
        { name: '라임즙', amount: '약간' },
      ],
      tipLabel: '대체 재료 팁',
      steps: [
        { text: '사워도우 빵을 가장자리가 바삭해질 때까지 노릇하게 구워주세요.' },
        { text: '아보카도를 으깬 후 소금, 후추, 라임즙을 넣고 섞어주세요.' },
        { text: '식초를 한 방울 넣은 끓는 물에 달걀을 정확히 3분간 수란으로 익혀주세요.' },
        { text: '토스트 위에 으깬 아보카도를 펴 바르고, 수란을 올린 뒤 소금과 후추로 마무리하세요.' },
      ],
    },
    // About
    about: {
      header: '우리의 이야기',
      heroText: '왜 OMG Table일까요?\n완벽한 식단보다,\n기분 좋은 한 끼가 더 큰 변화를 만드니까요.',
      whyTitle: '죄책감도, 부담도 없이.',
      whyDesc: '오늘 하루, 맛있는 식물성 한 끼를 선택하세요.',
      principles: [
        { title: '부담 없이', desc: '100% 비건이 되라고 강요하지 않아요. 식물성 한 입 한 입이 모두 의미 있습니다.' },
        { title: '쉽고 맛있게', desc: '맛과 간편함이 우선이에요. 요리가 하루의 하이라이트가 되어야 합니다.' },
        { title: '지속 가능한 즐거움', desc: '작은 습관이 지구와 당신 모두에게 큰 변화를 만듭니다.' },
      ],
    },
  },
}
