/**
 * Supabase Next.js Page Template
 * 
 * This file is created to fulfill your exact path request (/utils/supabase/page.tsx).
 * Note: If you are running a Next.js App Router project, this code can be used in your 'app/todos/page.tsx'.
 * For our current Vite + Express project, we have also provided active React Client-side 
 * and Express Server-side integration templates in this codebase.
 */

import { createClient } from './server'

// Mocking the cookies import for typescript compiler safety in Vite/Express
const cookies = async () => {
  return {
    getAll: () => [] as any[],
    set: (name: string, value: string, options: any) => {}
  }
}

export default async function Page() {
  // Retrieve the cookie store
  const cookieStore = await cookies()
  
  // Initialize the Supabase client
  const supabase = createClient(cookieStore)

  // Fetch data from the 'todos' table
  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')

  if (error) {
    console.error('Error fetching todos:', error)
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-sm border mt-8">
      <h1 className="text-xl font-bold mb-4">Supabase Todos list</h1>
      <ul className="space-y-2">
        {todos && todos.length > 0 ? (
          todos.map((todo: any) => (
            <li key={todo.id} className="p-3 bg-gray-50 rounded border flex items-center justify-between">
              <span>{todo.name}</span>
              {todo.is_completed && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
              )}
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-sm">
            No todos found. Make sure to create a "todos" table in your Supabase project with a "name" column.
          </li>
        )}
      </ul>
    </div>
  )
}
