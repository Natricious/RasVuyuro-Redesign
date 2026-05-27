export const GENRES = [
  'ყველა',
  'დრამა',
  'თრილერი',
  'კომედია',
  'რომანტიკა',
  'ისტორიული',
  'საშინელება',
  'კრიმინალური',
  'მუსიკალური',
  'თავგადასავალი',
]

export const SORT_OPTIONS = [
  { value: 'imdb_rating_desc', label: 'რეიტინგი',  column: 'imdb_rating', ascending: false },
  { value: 'year_desc',        label: 'ახალი',      column: 'year',        ascending: false },
  { value: 'year_asc',         label: 'ძველი',      column: 'year',        ascending: true  },
  { value: 'title_asc',        label: 'სათაური',    column: 'title',       ascending: true  },
]
