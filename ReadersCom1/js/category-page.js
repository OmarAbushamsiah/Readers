/**
 * Category page — side-nav tree + filtered product grid.
 * URL: category.html#<slug>   e.g. category.html#literature-fiction
 */
(function () {
  var mount = document.getElementById("category-page-mount");
  if (!mount) return;

  /* ── Product catalog ──────────────────────────────── */
  var PRODUCTS = [
    { isbn: "9781529964332", title: "Zorg: A Tale of Greed, Murder and the Abolition of…", author: "Siddharth Kara",                     price: "19.00", img: "https://readers.jo/image/cache/catalog/product/9781529964332-600x770.jpg",          categories: "Books, Adults & General Classification, Non-fiction, New titles" },
    { isbn: "9781035011438", title: "Girl Dinner",                                          author: "Olivie Blake",                       price: "16.50", img: "https://readers.jo/image/cache/catalog/product/9781035011438-600x770.jpg",          categories: "Books, Literature & Fiction, New titles" },
    { isbn: "9781529155419", title: "Land of Sweet Forever",                                author: "Harper Lee",                         price: "24.50", img: "https://readers.jo/image/cache/catalog/product/9781529155419-600x770.jpg",          categories: "Books, Adults & General Classification, Literature & Fiction, New titles" },
    { isbn: "9780008701840", title: "Birthing",                                             author: "Davina McCall",                      price: "24.50", img: "https://readers.jo/image/cache/catalog/product/9780008701840-600x770.jpg",          categories: "Books, Health & Wellbeing, New titles" },
    { isbn: "9781787334656", title: "Ferment: The Life-Changing Power of Microbes",         author: "Tim Spector",                        price: "27.50", img: "https://readers.jo/image/cache/catalog/product/9781787334656-600x770.jpg",          categories: "Books, Health, Fitness & Dieting, Science" },
    { isbn: "9781529146844", title: "Digital Exhaustion: Simple Rules for Reclaiming Yo…", author: "Paul Leonardi",                      price: "19.00", img: "https://readers.jo/image/cache/catalog/product/9781529146844-600x770.jpg",          categories: "Books, Business, Self-Help, New titles" },
    { isbn: "9781408783276", title: "Keeping Your Brain in Shape",                          author: "Mark Avery",                         price: "18.00", img: "https://readers.jo/image/cache/catalog/product/9781408783276-600x770.jpg",          categories: "Books, Health, Science, New titles" },
    { isbn: "9781399825788", title: "Finding Grace",                                        author: "Loretta Rothschild",                 price: "17.50", img: "https://readers.jo/image/cache/catalog/product/9781399825788-600x770.jpg",          categories: "Books, Literature & Fiction, New titles" },
    { isbn: "9781035064656", title: "Bury Our Bones in the Shallow Ground",                 author: "V.E. Schwab",                        price: "22.00", img: "https://readers.jo/image/cache/catalog/product/9781035064656-600x770.jpg",          categories: "Books, Science Fiction & Fantasy, New titles" },
    { isbn: "9780008640217", title: "End Game",                                             author: "Jeffrey Archer",                     price: "16.00", img: "https://readers.jo/image/cache/catalog/product/9780008640217-600x770.jpg",          categories: "Books, Mystery & Thriller, Fiction" },
    { isbn: "9780008466817", title: "Shattered Lands",                                     author: "Sam Dalrymple",                      price: "21.50", img: "https://readers.jo/image/cache/catalog/product/9780008466817-600x770.jpg",          categories: "Books, History, Non-fiction" },
    { isbn: "9780008710002", title: "Last Death of the Year",                               author: "Sophie Hannah",                      price: "19.50", img: "https://readers.jo/image/cache/catalog/product/9780008710002-600x770.jpg",          categories: "Books, Mystery & Thriller, Fiction" },
    { isbn: "9781784296124", title: "50 Islam Ideas You Really Need to Know",               author: "Dave Robinson",                      price: "14.50", img: "https://readers.jo/image/cache/catalog/product/9781784296124-600x770.jpg",          categories: "Books, Adults & General Classification, Philosophy & Religion" },
    { isbn: "9780674273559", title: "A Brief History Of Equality",                          author: "Thomas Piketty",                     price: "22.00", img: "https://readers.jo/image/cache/catalog/product/9780674273559-600x770.png",          categories: "Books, Adults & General Classification, Philosophy & Religion" },
    { isbn: "9780140444391", title: "A Discourse on Inequality",                            author: "Jean-Jacques Rousseau",              price: "11.00", img: "https://readers.jo/image/cache/catalog/product/9780140444391-600x770.jpg",          categories: "Books, Adults & General Classification, Philosophy & Religion" },
    { isbn: "9781847742599", title: "A Du'a Away: A Companion Journal",                     author: "Companion journal",                  price: "9.00",  img: "https://readers.jo/image/cache/catalog/product/9781847742599-600x770.jpg",          categories: "Books, Adults & General Classification, Philosophy & Religion" },
    { isbn: "9781838049218", title: "A Handbook of Spiritual Medicine",                     author: "Islamic tradition",                  price: "27.50", img: "https://readers.jo/image/cache/catalog/product/9781838049218-600x770.jpg",          categories: "Books, Adults & General Classification, Philosophy & Religion" },
    { isbn: "9780345384560", title: "A History of God",                                     author: "Karen Armstrong",                    price: "15.00", img: "https://readers.jo/image/cache/catalog/product/9780345384560-600x770.jpg",          categories: "Books, Adults & General Classification, Philosophy & Religion" },
    { isbn: "9781523524907", title: "1,000 Places to See Before You Die Picture-A-Day®",   author: "Patricia Schultz",                   price: "14.50", img: "https://readers.jo/image/cache/catalog/product/9781523524907-600x770.jpg",          categories: "Stationery, Calendars & Diaries" },
    { isbn: "8437015566894", title: "100 Places You Must Visit Before You Die Poster",      author: "Gift & décor",                       price: "12.40", img: "https://readers.jo/image/cache/catalog/product/8437015566894-600x770.jpg",          categories: "Stationery, Arts & Crafts" },
    { isbn: "8437015566924", title: "100 Things You Must Do Before You Die Poster",         author: "Gift & décor",                       price: "12.40", img: "https://readers.jo/image/cache/catalog/product/8437015566924-600x770.jpg",          categories: "Stationery, Arts & Crafts" },
    { isbn: "9781523524846", title: "365 Days in Italy Picture-A-Day® Wall Calendar",       author: "Workman Calendars",                  price: "14.50", img: "https://readers.jo/image/cache/catalog/product/9781523524846-600x770.jpg",          categories: "Stationery, Calendars & Diaries" },
    { isbn: "9781523524693", title: "365 Days of Shoes Picture-A-Day® Wall Calendar",       author: "Workman Calendars",                  price: "14.50", img: "https://readers.jo/image/cache/catalog/product/9781523524693-600x770.jpg",          categories: "Stationery, Calendars & Diaries" },
    { isbn: "9781523525218", title: "365 Kittens-A-Year Picture-A-Day® Wall Calendar",      author: "Workman Calendars",                  price: "14.50", img: "https://readers.jo/image/cache/catalog/product/9781523525218-600x770.jpg",          categories: "Stationery, Calendars & Diaries" },
    { isbn: "9781804290446", title: "A Philosophy of Walking",                              author: "Frédéric Gros",                      price: "11.00", img: "https://readers.jo/image/cache/catalog/product/9781804290446-600x770.jpg",          categories: "Books, Philosophy & Religion, New titles" },
    { isbn: "9780753554142", title: "A Short Philosophy of Birds",                          author: "Philippe J. Dubois & Elise Rousseau", price: "11.00", img: "https://readers.jo/image/cache/catalog/product/9780753554142-600x770.jpg",         categories: "Books, Philosophy & Religion, Nature" },
    { isbn: "9781847740670", title: "A Treasury of Hadith",                                 author: "Imam Nawawi",                        price: "12.50", img: "https://readers.jo/image/cache/catalog/product/9781847740670-600x770.jpg",          categories: "Books, Philosophy & Religion" },
    { isbn: "9780140432442", title: "A Treatise of Human Nature",                           author: "David Hume",                         price: "16.50", img: "https://readers.jo/image/cache/catalog/product/9780140432442-600x770.jpg",          categories: "Books, Philosophy & Religion, Classics" },
    { isbn: "9781760632717", title: "Advice for the Dying (and Those Who Love Them)",       author: "Sallie Tisdale",                     price: "5.30",  img: "https://readers.jo/image/cache/catalog/product/9781760632717-600x770.jpg",          categories: "Books, Health, Family, Philosophy & Religion" },
    { isbn: "9781906949334", title: "A Thinking Person's Guide To Islam",                   author: "Prince Ghazi Muhammad",              price: "13.50", img: "https://readers.jo/image/cache/catalog/product/special/9781906949334-600x770.jpg",  categories: "Books, Philosophy & Religion" },
  ];

  /* ── Category filter map ──────────────────────────── */
  var _no  = function ()  { return false; };
  var _all = function ()  { return true;  };
  var CATEGORY_TESTS = {
    /* ── top-level ── */
    "all":                     _all,
    "new-titles":              function (p) { return p.categories.indexOf("New titles") !== -1; },
    "readers-recommends":      _no,
    "reading-is-resistance":   _no,
    "booktok":                 _no,
    /* ── Little Readers ── */
    "little-readers":          _no,
    "books-0-3":               _no,
    "picture-books":           _no,
    "fiction-6-8":             _no,
    "fiction-8-10":            _no,
    "fiction-10-12":           _no,
    "fiction-12-14":           _no,
    "poetry-classics":         _no,
    "character-series":        _no,
    "activity-books":          _no,
    "childrens-reference":     _no,
    "workbooks-study":         _no,
    /* ── Teen & Young Adult ── */
    "teen-young-adult":        _no,
    "ya-fiction":              _no,
    "ya-reference":            _no,
    /* ── Adults & General Classification ── */
    "adults-general":          function (p) { return p.categories.indexOf("Adults & General Classification") !== -1; },
    "arts-photography":        _no,
    "coffee-table":            _no,
    "cookbooks":               _no,
    "politics-social":         _no,
    "biographies-memoirs":     _no,
    "history":                 function (p) { return p.categories.indexOf("History") !== -1; },
    "science":                 _no,
    "philosophy-religion":     function (p) { return p.categories.indexOf("Philosophy & Religion") !== -1; },
    "health-fitness":          function (p) { return p.categories.indexOf("Health") !== -1; },
    "spirituality":            _no,
    "self-help":               function (p) { return p.categories.indexOf("Self-Help") !== -1; },
    "family":                  _no,
    "reference":               _no,
    "business-finance":        function (p) { return p.categories.indexOf("Business") !== -1; },
    "graphic-novels":          _no,
    "literature-fiction":      function (p) { return p.categories.indexOf("Literature & Fiction") !== -1; },
    "mystery-thriller":        function (p) { return p.categories.indexOf("Mystery & Thriller") !== -1; },
    "sci-fi-fantasy":          function (p) { return p.categories.indexOf("Science Fiction & Fantasy") !== -1; },
    "historical-fiction":      _no,
    "romance":                 _no,
    /* ── Arabic Books ── */
    "arabic-books":            _no,
    "ar-childrens-stories":    _no,
    "ar-childrens-reference":  _no,
    "ar-poetry-literature":    _no,
    "ar-arabic-stories":       _no,
    "ar-translated":           _no,
    "ar-cooking":              _no,
    "ar-biography":            _no,
    "ar-history-reference":    _no,
    "ar-politics":             _no,
    "ar-philosophy":           _no,
    "ar-religion":             _no,
    "ar-business":             _no,
    "ar-self-help":            _no,
    /* ── Gadgets & Accessories ── */
    "gadgets-accessories":     _no,
    "book-accessories":        _no,
    "book-lights-lamps":       _no,
    "bookmarks":               _no,
    "reading-glasses":         _no,
    "other-accessories":       _no,
    "accessories":             _no,
    "home-lifestyle":          _no,
    /* ── Stationery ── */
    "stationery":              function (p) { return p.categories.indexOf("Stationery") !== -1; },
    "stationery-general":      function (p) { return p.categories.indexOf("Stationery") !== -1; },
    "arts-crafts":             function (p) { return p.categories.indexOf("Arts & Crafts") !== -1; },
    "notebooks-journals":      _no,
    "calendars-diaries":       function (p) { return p.categories.indexOf("Calendars & Diaries") !== -1; },
    "gift-wrap":               _no,
    /* ── Toys ── */
    "toys":                    _no,
    "toys-general":            _no,
    "board-games":             _no,
    "puzzles":                 _no,
    "educational-toys":        _no,
  };

  var CATEGORY_LABELS = {
    "all":                    "All Books",
    "new-titles":             "New Titles",
    "readers-recommends":     "Readers Recommends",
    "reading-is-resistance":  "Reading Is Resistance",
    "booktok":                "BookTok",
    "little-readers":         "Little Readers",
    "books-0-3":              "Children's Books 0–3",
    "picture-books":          "Picture Books",
    "fiction-6-8":            "Children's Fiction 6–8",
    "fiction-8-10":           "Children's Fiction 8–10",
    "fiction-10-12":          "Children's Fiction 10–12",
    "fiction-12-14":          "Children's Fiction 12–14",
    "poetry-classics":        "Children's Poetry & Classics",
    "character-series":       "Character & Series",
    "activity-books":         "Activity Books",
    "childrens-reference":    "Children's Reference",
    "workbooks-study":        "Workbooks & Study Guides",
    "teen-young-adult":       "Teen & Young Adult",
    "ya-fiction":             "Young Adult Fiction",
    "ya-reference":           "Young Adult Reference",
    "adults-general":         "Adults & General Classification",
    "arts-photography":       "Arts & Photography",
    "coffee-table":           "Coffee Table",
    "cookbooks":              "Cookbooks",
    "politics-social":        "Politics & Social Sciences",
    "biographies-memoirs":    "Biographies & Memoirs",
    "history":                "History",
    "science":                "Science",
    "philosophy-religion":    "Philosophy & Religion",
    "health-fitness":         "Health, Fitness & Dieting",
    "spirituality":           "Spirituality",
    "self-help":              "Self-Help",
    "family":                 "Family",
    "reference":              "Reference",
    "business-finance":       "Business, Finance & Economy",
    "graphic-novels":         "Graphic Novels & Comics",
    "literature-fiction":     "Literature & Fiction",
    "mystery-thriller":       "Mystery, Thriller & Suspense",
    "sci-fi-fantasy":         "Science Fiction & Fantasy",
    "historical-fiction":     "Historical Fiction",
    "romance":                "Romance",
    "arabic-books":           "Arabic Books",
    "ar-childrens-stories":   "قصص أطفال",
    "ar-childrens-reference": "مراجع أطفال",
    "ar-poetry-literature":   "شعر وأدب",
    "ar-arabic-stories":      "قصص عربية",
    "ar-translated":          "أعمال مترجمة",
    "ar-cooking":             "طبخ",
    "ar-biography":           "السيرة الذاتية",
    "ar-history-reference":   "تاريخ ومراجع",
    "ar-politics":            "سياسة",
    "ar-philosophy":          "فكر وفلسفة",
    "ar-religion":            "دين",
    "ar-business":            "ادارة اعمال",
    "ar-self-help":           "مساعدة الذات",
    "gadgets-accessories":    "Gadgets & Accessories",
    "book-accessories":       "Book Accessories",
    "book-lights-lamps":      "Book Lights & Lamps",
    "bookmarks":              "Bookmarks",
    "reading-glasses":        "Reading Glasses & Magnifiers",
    "other-accessories":      "Other Book Accessories",
    "accessories":            "Accessories",
    "home-lifestyle":         "Home & Lifestyle",
    "stationery":             "Stationery",
    "stationery-general":     "Stationery",
    "arts-crafts":            "Arts & Crafts",
    "notebooks-journals":     "Notebooks & Journals",
    "calendars-diaries":      "Calendars & Diaries",
    "gift-wrap":              "Gift Wrap & Accessories",
    "toys":                   "Toys",
    "toys-general":           "Toys",
    "board-games":            "Board Games",
    "puzzles":                "Puzzles",
    "educational-toys":       "Educational Toys",
  };

  /* ── Side-nav tree definition ─────────────────────── */
  /*
   * Node types:
   *   { type:"link",   label, href, icon }               — plain navigable link
   *   { type:"toggle", label, icon, open, children }     — expand/collapse only (no own href)
   *   { type:"split",  label, href, icon, open, children}— link + separate expand chevron
   *   { type:"divider" }                                  — <hr>
   */
  var L = "category.html#"; /* shorthand */
  var NAV_TREE = [
    { type: "link",   label: "Home", href: "index.html", icon: "fa-solid fa-house" },

    /* ── Books ─────────────────────────────────────── */
    { type: "split",  label: "Books", href: L + "all", icon: "fa-solid fa-book-open", open: true, children: [

      /* Little Readers */
      { type: "toggle", label: "Little Readers", icon: "fa-solid fa-child-reaching", open: false, children: [
        { type: "link", label: "Children's Books 0–3",    href: L + "books-0-3",          icon: "fa-solid fa-baby" },
        { type: "link", label: "Picture Books",            href: L + "picture-books",       icon: "fa-solid fa-palette" },
        { type: "link", label: "Children's Fiction 6–8",  href: L + "fiction-6-8",         icon: "fa-solid fa-dragon" },
        { type: "link", label: "Children's Fiction 8–10", href: L + "fiction-8-10",        icon: "fa-solid fa-hat-wizard" },
        { type: "link", label: "Children's Fiction 10–12",href: L + "fiction-10-12",       icon: "fa-solid fa-wand-sparkles" },
        { type: "link", label: "Children's Fiction 12–14",href: L + "fiction-12-14",       icon: "fa-solid fa-star" },
        { type: "link", label: "Poetry & Classics",       href: L + "poetry-classics",     icon: "fa-solid fa-scroll" },
        { type: "link", label: "Character & Series",      href: L + "character-series",    icon: "fa-solid fa-masks-theater" },
        { type: "link", label: "Activity Books",          href: L + "activity-books",      icon: "fa-solid fa-paintbrush" },
        { type: "link", label: "Children's Reference",    href: L + "childrens-reference", icon: "fa-solid fa-magnifying-glass" },
        { type: "link", label: "Workbooks & Study Guides",href: L + "workbooks-study",     icon: "fa-solid fa-graduation-cap" },
      ]},

      /* Teen & Young Adult */
      { type: "toggle", label: "Teen & Young Adult", icon: "fa-solid fa-person", open: false, children: [
        { type: "link", label: "Young Adult Fiction",   href: L + "ya-fiction",    icon: "fa-solid fa-book-open-reader" },
        { type: "link", label: "Young Adult Reference", href: L + "ya-reference",  icon: "fa-solid fa-book-atlas" },
      ]},

      /* Adults & General Classification */
      { type: "toggle", label: "Adults & General", icon: "fa-solid fa-person-half-dress", open: false, children: [
        { type: "link", label: "Arts & Photography",       href: L + "arts-photography",    icon: "fa-solid fa-camera" },
        { type: "link", label: "Coffee Table",             href: L + "coffee-table",        icon: "fa-solid fa-mug-hot" },
        { type: "link", label: "Cookbooks",                href: L + "cookbooks",           icon: "fa-solid fa-utensils" },
        { type: "link", label: "Politics & Social Sciences",href: L + "politics-social",   icon: "fa-solid fa-scale-balanced" },
        { type: "link", label: "Biographies & Memoirs",   href: L + "biographies-memoirs",  icon: "fa-solid fa-user-pen" },
        { type: "link", label: "History",                  href: L + "history",             icon: "fa-solid fa-landmark" },
        { type: "link", label: "Science",                  href: L + "science",             icon: "fa-solid fa-flask" },
        { type: "link", label: "Philosophy & Religion",    href: L + "philosophy-religion", icon: "fa-solid fa-yin-yang" },
        { type: "link", label: "Health, Fitness & Dieting",href: L + "health-fitness",     icon: "fa-solid fa-heart-pulse" },
        { type: "link", label: "Spirituality",             href: L + "spirituality",        icon: "fa-solid fa-hands-praying" },
        { type: "link", label: "Self-Help",                href: L + "self-help",           icon: "fa-solid fa-seedling" },
        { type: "link", label: "Family",                   href: L + "family",              icon: "fa-solid fa-people-roof" },
        { type: "link", label: "Reference",                href: L + "reference",           icon: "fa-solid fa-book-bookmark" },
        { type: "link", label: "Business, Finance & Economy",href: L + "business-finance", icon: "fa-solid fa-briefcase" },
        { type: "link", label: "Graphic Novels & Comics",  href: L + "graphic-novels",      icon: "fa-solid fa-mask" },
        { type: "link", label: "Literature & Fiction",     href: L + "literature-fiction",  icon: "fa-solid fa-feather-pointed" },
        { type: "link", label: "Mystery, Thriller & Suspense",href: L + "mystery-thriller", icon: "fa-solid fa-magnifying-glass" },
        { type: "link", label: "Science Fiction & Fantasy",href: L + "sci-fi-fantasy",      icon: "fa-solid fa-rocket" },
        { type: "link", label: "Historical Fiction",       href: L + "historical-fiction",  icon: "fa-solid fa-scroll" },
        { type: "link", label: "Romance",                  href: L + "romance",             icon: "fa-solid fa-heart" },
      ]},

      /* Arabic Books */
      { type: "split",  label: "Arabic Books", href: L + "arabic-books", icon: "fa-solid fa-language", open: false, children: [
        { type: "link", label: "قصص أطفال",     href: L + "ar-childrens-stories",   icon: "fa-solid fa-child" },
        { type: "link", label: "مراجع أطفال",    href: L + "ar-childrens-reference", icon: "fa-solid fa-book" },
        { type: "link", label: "شعر وأدب",      href: L + "ar-poetry-literature",   icon: "fa-solid fa-feather" },
        { type: "link", label: "قصص عربية",     href: L + "ar-arabic-stories",      icon: "fa-solid fa-book-open" },
        { type: "link", label: "أعمال مترجمة",  href: L + "ar-translated",          icon: "fa-solid fa-language" },
        { type: "link", label: "طبخ",           href: L + "ar-cooking",             icon: "fa-solid fa-utensils" },
        { type: "link", label: "السيرة الذاتية", href: L + "ar-biography",           icon: "fa-solid fa-user-pen" },
        { type: "link", label: "تاريخ ومراجع",  href: L + "ar-history-reference",   icon: "fa-solid fa-landmark" },
        { type: "link", label: "سياسة",         href: L + "ar-politics",            icon: "fa-solid fa-scale-balanced" },
        { type: "link", label: "فكر وفلسفة",    href: L + "ar-philosophy",          icon: "fa-solid fa-yin-yang" },
        { type: "link", label: "دين",           href: L + "ar-religion",            icon: "fa-solid fa-mosque" },
        { type: "link", label: "ادارة اعمال",   href: L + "ar-business",            icon: "fa-solid fa-briefcase" },
        { type: "link", label: "مساعدة الذات",  href: L + "ar-self-help",           icon: "fa-solid fa-seedling" },
      ]},
    ]},

    { type: "divider" },

    /* ── Gadgets & Accessories ──────────────────────── */
    { type: "split",  label: "Gadgets & Accessories", href: L + "gadgets-accessories", icon: "fa-solid fa-headphones", open: false, children: [
      { type: "toggle", label: "Book Accessories", icon: "fa-solid fa-bookmark", open: false, children: [
        { type: "link", label: "Book Lights & Lamps",        href: L + "book-lights-lamps" },
        { type: "link", label: "Bookmarks",                  href: L + "bookmarks" },
        { type: "link", label: "Reading Glasses & Magnifiers",href: L + "reading-glasses" },
        { type: "link", label: "Other Book Accessories",     href: L + "other-accessories" },
      ]},
      { type: "link", label: "Accessories",     href: L + "accessories",    icon: "fa-solid fa-bag-shopping" },
      { type: "link", label: "Home & Lifestyle",href: L + "home-lifestyle", icon: "fa-solid fa-couch" },
    ]},

    /* ── Stationery ─────────────────────────────────── */
    { type: "split", label: "Stationery", href: L + "stationery", icon: "fa-solid fa-pen-ruler", open: false, children: [
      { type: "link", label: "Stationery",               href: L + "stationery-general" },
      { type: "link", label: "Arts & Crafts",            href: L + "arts-crafts" },
      { type: "link", label: "Notebooks & Journals",     href: L + "notebooks-journals" },
      { type: "link", label: "Calendars & Diaries",      href: L + "calendars-diaries" },
      { type: "link", label: "Gift Wrap & Accessories",  href: L + "gift-wrap" },
    ]},

    /* ── Toys ───────────────────────────────────────── */
    { type: "split",  label: "Toys", href: L + "toys", icon: "fa-solid fa-puzzle-piece", open: false, children: [
      { type: "link", label: "Toys",             href: L + "toys-general" },
      { type: "link", label: "Board Games",      href: L + "board-games" },
      { type: "link", label: "Puzzles",          href: L + "puzzles" },
      { type: "link", label: "Educational Toys", href: L + "educational-toys" },
    ]},

    { type: "divider" },

    { type: "link", label: "Special Offers", href: "#", icon: "fa-solid fa-tags" },
  ];

  /* ── Sort options ─────────────────────────────────── */
  var SORTS = [
    { value: "featured",   label: "Featured" },
    { value: "az",         label: "Title A–Z" },
    { value: "za",         label: "Title Z–A" },
    { value: "price-asc",  label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
  ];

  /* ── State ────────────────────────────────────────── */
  var currentSlug = "all";
  var currentSort = "featured";

  /* ── Helpers ──────────────────────────────────────── */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugFromHash() {
    var h = (location.hash || "").replace(/^#/, "").trim();
    return (h && CATEGORY_TESTS[h]) ? h : "all";
  }

  function labelForSlug(slug) {
    return CATEGORY_LABELS[slug] || "All Books";
  }

  function filterProducts() {
    var test = CATEGORY_TESTS[currentSlug] || CATEGORY_TESTS["all"];
    return PRODUCTS.filter(test);
  }

  function sortProducts(list) {
    var s = list.slice();
    if (currentSort === "az")         s.sort(function (a, b) { return a.title.localeCompare(b.title); });
    else if (currentSort === "za")    s.sort(function (a, b) { return b.title.localeCompare(a.title); });
    else if (currentSort === "price-asc")  s.sort(function (a, b) { return parseFloat(a.price) - parseFloat(b.price); });
    else if (currentSort === "price-desc") s.sort(function (a, b) { return parseFloat(b.price) - parseFloat(a.price); });
    return s;
  }

  /* ── Side-nav rendering ───────────────────────────── */

  /** Returns true when node itself (or any descendant link) matches currentSlug */
  function nodeContainsSlug(node) {
    if (node.href) {
      var h = (node.href.split("#")[1] || "").trim();
      if (h === currentSlug) return true;
    }
    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        if (nodeContainsSlug(node.children[i])) return true;
      }
    }
    return false;
  }

  function renderNavItems(items) {
    return items.map(function (node) {
      if (node.type === "divider") {
        return '<li class="cat-sidenav__divider" role="separator" aria-hidden="true"></li>';
      }
      if (node.type === "section") {
        return '<li><span class="cat-sidenav__section-label">' + escapeHtml(node.label) + '</span></li>';
      }

      /* Determine if this node or a descendant is active */
      var isActive   = node.href && (node.href.split("#")[1] || "").trim() === currentSlug;
      var hasActive  = nodeContainsSlug(node);
      /* Auto-open if the node is marked open OR contains the active slug */
      var isOpen     = node.open || hasActive;

      if (node.type === "link") {
        return (
          '<li>' +
            '<a class="cat-sidenav__link' + (isActive ? " is-active" : "") + '" href="' + escapeHtml(node.href) + '">' +
              (node.icon ? '<i class="' + node.icon + ' cat-sidenav__icon" aria-hidden="true"></i>' : '<i class="cat-sidenav__icon" aria-hidden="true"></i>') +
              '<span dir="auto">' + escapeHtml(node.label) + '</span>' +
            '</a>' +
          '</li>'
        );
      }

      if (node.type === "toggle") {
        return (
          '<li>' +
            '<button class="cat-sidenav__toggle" aria-expanded="' + (isOpen ? "true" : "false") + '" type="button">' +
              (node.icon ? '<i class="' + node.icon + ' cat-sidenav__icon" aria-hidden="true"></i>' : '<i class="cat-sidenav__icon" aria-hidden="true"></i>') +
              '<span dir="auto">' + escapeHtml(node.label) + '</span>' +
              '<i class="fa-solid fa-chevron-right cat-sidenav__chevron" aria-hidden="true"></i>' +
            '</button>' +
            '<ul class="cat-sidenav__sublist"' + (isOpen ? '' : ' hidden') + '>' +
              renderNavItems(node.children || []) +
            '</ul>' +
          '</li>'
        );
      }

      if (node.type === "split") {
        return (
          '<li>' +
            '<div class="cat-sidenav__split-row' + (isActive ? " is-active" : "") + '">' +
              '<a class="cat-sidenav__link" href="' + escapeHtml(node.href) + '">' +
                (node.icon ? '<i class="' + node.icon + ' cat-sidenav__icon" aria-hidden="true"></i>' : '<i class="cat-sidenav__icon" aria-hidden="true"></i>') +
                '<span dir="auto">' + escapeHtml(node.label) + '</span>' +
              '</a>' +
              '<button class="cat-sidenav__expander" type="button" aria-expanded="' + (isOpen ? "true" : "false") + '" aria-label="' + escapeHtml("Expand " + node.label) + '">' +
                '<i class="fa-solid fa-chevron-right cat-sidenav__chevron" aria-hidden="true"></i>' +
              '</button>' +
            '</div>' +
            '<ul class="cat-sidenav__sublist"' + (isOpen ? '' : ' hidden') + '>' +
              renderNavItems(node.children || []) +
            '</ul>' +
          '</li>'
        );
      }

      return "";
    }).join("");
  }

  function renderSideNav() {
    return (
      '<aside class="cat-sidenav" id="cat-sidenav" aria-label="Browse categories">' +
        '<nav>' +
          '<ul class="cat-sidenav__list">' +
            renderNavItems(NAV_TREE) +
          '</ul>' +
        '</nav>' +
      '</aside>'
    );
  }

  /* ── Content area rendering ───────────────────────── */
  function renderBreadcrumb() {
    var label = labelForSlug(currentSlug);
    return (
      '<ol class="cat-breadcrumb" aria-label="Breadcrumb">' +
        '<li><a href="index.html">Home</a></li>' +
        '<li><a href="category.html#all">Books</a></li>' +
        (currentSlug !== "all" ? '<li>' + escapeHtml(label) + '</li>' : '') +
      '</ol>'
    );
  }

  function renderToolbar(count) {
    var opts = SORTS.map(function (s) {
      return '<option value="' + s.value + '"' + (s.value === currentSort ? " selected" : "") + '>' + s.label + '</option>';
    }).join("");
    return (
      '<div class="cat-toolbar">' +
        '<p class="cat-toolbar__left">' + count + (count === 1 ? " product" : " products") + '</p>' +
        '<div class="cat-sort">' +
          '<span class="cat-sort__label">Sort by:</span>' +
          '<select class="cat-sort__select" id="cat-sort-select" aria-label="Sort products">' + opts + '</select>' +
        '</div>' +
      '</div>'
    );
  }

  function renderCard(item) {
    var href      = "product.html#" + item.isbn;
    var wished    = window.ReadersWishlist && window.ReadersWishlist.isWishlisted(item.isbn);
    return (
      '<article class="book-card" data-isbn="' + escapeHtml(item.isbn) + '">' +
        '<a href="' + escapeHtml(href) + '" class="book-card__link">' +
          '<span class="visually-hidden">View ' + escapeHtml(item.title) + '</span>' +
        '</a>' +
        '<div class="book-card__cover">' +
          '<img src="' + escapeHtml(item.img) + '" alt="Cover: ' + escapeHtml(item.title) + '" width="600" height="770" loading="lazy" decoding="async" />' +
          '<div class="book-card__overlay">' +
            '<div class="book-card__actions">' +
              '<button type="button" class="book-card__cta">Add to cart</button>' +
              '<button type="button" class="book-card__wish" aria-label="' + (wished ? "Remove from" : "Add to") + ' wish list" aria-pressed="' + (wished ? "true" : "false") + '">' +
                '<i class="' + (wished ? "fa-solid" : "fa-regular") + ' fa-heart" aria-hidden="true"></i>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="book-card__body">' +
          '<h3 class="book-card__title">' + escapeHtml(item.title) + '</h3>' +
          '<p class="book-card__author">' + escapeHtml(item.author) + '</p>' +
          '<p class="book-card__price"><span class="book-card__currency">JOD</span> ' + escapeHtml(item.price) + '</p>' +
        '</div>' +
      '</article>'
    );
  }

  function renderEmpty() {
    var label = labelForSlug(currentSlug);
    return (
      '<div class="cat-empty">' +
        '<div class="cat-empty__icon" aria-hidden="true"><i class="fa-regular fa-face-sad-tear"></i></div>' +
        '<h2 class="cat-empty__title">No books found</h2>' +
        '<p class="cat-empty__hint">There are no books in <strong>' + escapeHtml(label) + '</strong> yet. Check back soon!</p>' +
        '<a class="cat-empty__cta" href="category.html#all">Browse all books</a>' +
      '</div>'
    );
  }

  /* ── Main render ──────────────────────────────────── */
  function render() {
    currentSlug = slugFromHash();
    var label   = labelForSlug(currentSlug);
    var items   = sortProducts(filterProducts());

    document.title = (currentSlug === "all" ? "Books" : label) + " — Readers Bookshop";

    /* Mobile toggle button (hidden via CSS on desktop) */
    var mobileBtn =
      '<button class="cat-sidenav-toggle-btn" id="cat-sidenav-toggle-btn" type="button" aria-expanded="false" aria-controls="cat-sidenav">' +
        '<i class="fa-solid fa-bars-filter" aria-hidden="true"></i>' +
        '<span>Browse Categories</span>' +
        '<i class="fa-solid fa-chevron-down cat-sidenav-toggle-btn__chevron" aria-hidden="true"></i>' +
      '</button>';

    /* Content area */
    var content =
      renderBreadcrumb() +
      '<div class="cat-header">' +
        '<h1 class="cat-header__title">' + escapeHtml(label) + '</h1>' +
        '<p class="cat-header__count">' + items.length + (items.length === 1 ? " book" : " books") + '</p>' +
      '</div>' +
      renderToolbar(items.length) +
      (items.length ? '<div class="cat-grid">' + items.map(renderCard).join("") + '</div>' : renderEmpty());

    mount.innerHTML =
      mobileBtn +
      '<div class="cat-layout">' +
        renderSideNav() +
        '<div class="cat-content">' + content + '</div>' +
      '</div>';

    bindEvents();
  }

  /* ── Event binding ────────────────────────────────── */
  function bindEvents() {
    /* Sort select */
    var sel = mount.querySelector("#cat-sort-select");
    if (sel) {
      sel.addEventListener("change", function () {
        currentSort = sel.value;
        render();
      });
    }

    /* Mobile sidebar toggle */
    var mobileBtn = mount.querySelector("#cat-sidenav-toggle-btn");
    var sidenav   = mount.querySelector("#cat-sidenav");
    if (mobileBtn && sidenav) {
      /* Start collapsed on mobile */
      if (window.innerWidth <= 720) {
        sidenav.setAttribute("hidden", "");
        mobileBtn.setAttribute("aria-expanded", "false");
      } else {
        sidenav.removeAttribute("hidden");
      }
      mobileBtn.addEventListener("click", function () {
        var open = sidenav.hasAttribute("hidden");
        if (open) {
          sidenav.removeAttribute("hidden");
          mobileBtn.setAttribute("aria-expanded", "true");
        } else {
          sidenav.setAttribute("hidden", "");
          mobileBtn.setAttribute("aria-expanded", "false");
        }
      });
    }

    /* Toggle buttons (type="toggle" nodes — no href, just expand) */
    mount.querySelectorAll(".cat-sidenav__toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        var sublist  = btn.nextElementSibling;
        if (!sublist) return;
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        if (expanded) {
          sublist.setAttribute("hidden", "");
        } else {
          sublist.removeAttribute("hidden");
        }
      });
    });

    /* Expander buttons (type="split" nodes — separate expand chevron) */
    mount.querySelectorAll(".cat-sidenav__expander").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        /* The sublist is the next sibling of the split-row's parent li */
        var li       = btn.closest("li");
        var sublist  = li && li.querySelector(":scope > .cat-sidenav__sublist");
        if (!sublist) return;
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        if (expanded) {
          sublist.setAttribute("hidden", "");
        } else {
          sublist.removeAttribute("hidden");
        }
      });
    });

    /* Sidebar nav links — SPA-style: prevent full reload, push hash, re-render */
    mount.querySelectorAll(".cat-sidenav__link[href]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href") || "";
        /* Only intercept category.html# links */
        if (href.indexOf("category.html#") === -1) return;
        e.preventDefault();
        var hash = href.replace(/^.*#/, "");
        history.pushState(null, "", "category.html#" + hash);
        render();
        /* On mobile, close the sidebar after navigating */
        var sid = mount.querySelector("#cat-sidenav");
        var mob = mount.querySelector("#cat-sidenav-toggle-btn");
        if (sid && mob && window.innerWidth <= 720) {
          sid.setAttribute("hidden", "");
          mob.setAttribute("aria-expanded", "false");
        }
        /* Scroll content area to top */
        var content = mount.querySelector(".cat-content");
        if (content) content.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    /* Add-to-cart */
    mount.querySelectorAll(".book-card__cta").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!window.ReadersCart) return;
        var card = btn.closest(".book-card");
        if (!card) return;
        var isbn = card.dataset.isbn;
        for (var i = 0; i < PRODUCTS.length; i++) {
          if (PRODUCTS[i].isbn === isbn) {
            var p = PRODUCTS[i];
            window.ReadersCart.add({ isbn: p.isbn, title: p.title, author: p.author, price: p.price, img: p.img }, 1);
            break;
          }
        }
      });
    });

    /* Wishlist: handled by book-card-wishlist.js document delegation */
  }

  /* Re-render on browser back/forward */
  window.addEventListener("hashchange", function () { render(); });
  window.addEventListener("popstate",   function () { render(); });

  render();
})();
