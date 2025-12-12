export type QuestionType = 'text' | 'number' | 'select'

export interface QuestionOption {
  label: string
  value: string
}

export interface Question {
  id: string
  label: string
  description?: string
  type: QuestionType
  options?: QuestionOption[]
  placeholder?: string
}

export interface Section {
  id: string
  title: string
  questions: Question[]
}
