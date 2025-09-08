'use client'

import React from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Todo, QuickTag, KanbanColumn } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

interface KanbanBoardProps {
  columns: KanbanColumn[]
  todos: Todo[]
  selectedTodos: Set<string>
  isBusinessUser: boolean
  quickTags: QuickTag[]
  onToggleSelection: (todoId: string) => void
  onEditTodo: (todo: Todo) => void
  onDeleteTodo: (todoId: string) => void
  onDragDrop: (todoId: string, targetStatus: string) => void
  canUpdate: boolean
  canDelete: boolean
}

interface TodoCardProps {
  todo: Todo
  isSelected: boolean
  quickTags: QuickTag[]
  onToggleSelection: (todoId: string) => void
  onEditTodo: (todo: Todo) => void
  onDeleteTodo: (todoId: string) => void
  canUpdate: boolean
  canDelete: boolean
}

const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  isSelected,
  quickTags,
  onToggleSelection,
  onEditTodo,
  onDeleteTodo,
  canUpdate,
  canDelete
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'todo',
    item: { id: todo.id, status: todo.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const getTagColor = (tagId: string) => {
    const tag = quickTags.find(t => t.id === tagId)
    return tag?.color || '#6b7280'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('zh-TW')
  }

  return (
    <div
      ref={drag}
      className={`mb-3 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <Card className="cursor-move hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(todo.id)}
              className="mt-1"
            />
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-800 mb-2 break-words">
                {todo.title}
              </h4>
              
              {todo.description && (
                <p className="text-xs text-gray-600 mb-2 break-words">
                  {todo.description}
                </p>
              )}
              
              {todo.tags && todo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {todo.tags.map((tagId) => (
                    <Badge
                      key={tagId}
                      variant="secondary"
                      className="text-xs px-2 py-0.5"
                      style={{
                        backgroundColor: `${getTagColor(tagId)}20`,
                        color: getTagColor(tagId),
                        borderColor: getTagColor(tagId)
                      }}
                    >
                      {quickTags.find(t => t.id === tagId)?.name || tagId}
                    </Badge>
                  ))}
                </div>
              )}
              
              {todo.due_date && (
                <p className="text-xs text-gray-500 mb-2">
                  到期: {formatDate(todo.due_date)}
                </p>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {formatDate(todo.created_at)}
                </span>
                
                <div className="flex gap-1">
                  {canUpdate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditTodo(todo)}
                      className="h-6 w-6 p-0 hover:bg-primary/10"
                    >
                      ✏️
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTodo(todo.id)}
                      className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      🗑️
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface KanbanColumnProps {
  column: KanbanColumn
  todos: Todo[]
  selectedTodos: Set<string>
  quickTags: QuickTag[]
  onToggleSelection: (todoId: string) => void
  onEditTodo: (todo: Todo) => void
  onDeleteTodo: (todoId: string) => void
  onDragDrop: (todoId: string, targetStatus: string) => void
  canUpdate: boolean
  canDelete: boolean
}

const KanbanColumnComponent: React.FC<KanbanColumnProps> = ({
  column,
  todos,
  selectedTodos,
  quickTags,
  onToggleSelection,
  onEditTodo,
  onDeleteTodo,
  onDragDrop,
  canUpdate,
  canDelete
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'todo',
    drop: (item: { id: string; status: string }) => {
      if (item.status !== column.id) {
        onDragDrop(item.id, column.id)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const columnTodos = todos.filter(todo => todo.status === column.id)

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-0 ${isOver ? 'bg-primary/5' : ''} transition-colors rounded-lg`}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-lg">{column.icon}</span>
            {column.title}
            <Badge variant="secondary" className="ml-auto">
              {columnTodos.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto">
            {columnTodos.map(todo => (
              <TodoCard
                key={todo.id}
                todo={todo}
                isSelected={selectedTodos.has(todo.id)}
                quickTags={quickTags}
                onToggleSelection={onToggleSelection}
                onEditTodo={onEditTodo}
                onDeleteTodo={onDeleteTodo}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            ))}
            
            {columnTodos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">暫無任務</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const KanbanBoard: React.FC<KanbanBoardProps> = (props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {props.columns.map(column => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            todos={props.todos}
            selectedTodos={props.selectedTodos}
            quickTags={props.quickTags}
            onToggleSelection={props.onToggleSelection}
            onEditTodo={props.onEditTodo}
            onDeleteTodo={props.onDeleteTodo}
            onDragDrop={props.onDragDrop}
            canUpdate={props.canUpdate}
            canDelete={props.canDelete}
          />
        ))}
      </div>
    </DndProvider>
  )
}