'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/todos';

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  // Fetch todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      setTodos(data);
      setError(null);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(msg || 'Cannot connect to server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Add todo
  const addTodo = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    try {
      const { data } = await axios.post(API_URL, { title: inputValue });
      setTodos([data, ...todos]);
      setInputValue('');
    } catch {
      setError('Failed to add todo.');
    }
  };

  // Toggle completed
  const toggleTodo = async (id, completed) => {
    try {
      const { data } = await axios.put(`${API_URL}/${id}`, { completed: !completed });
      setTodos(todos.map((t) => (t._id === id ? data : t)));
    } catch {
      setError('Failed to update todo.');
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter((t) => t._id !== id));
    } catch {
      setError('Failed to delete todo.');
    }
  };

  // Start editing
  const startEdit = (todo) => {
    setEditId(todo._id);
    setEditValue(todo.title);
  };

  // Save edit
  const saveEdit = async (id) => {
    if (!editValue.trim()) return;
    try {
      const { data } = await axios.put(`${API_URL}/${id}`, { title: editValue });
      setTodos(todos.map((t) => (t._id === id ? data : t)));
      setEditId(null);
      setEditValue('');
    } catch {
      setError('Failed to update todo.');
    }
  };

  // Filtered todos
  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '64px', height: '64px', borderRadius: '20px', marginBottom: '16px',
          background: 'linear-gradient(135deg, var(--accent), var(--success))',
          boxShadow: '0 0 32px var(--accent-glow)',
          fontSize: '28px'
        }}>
          ✅
        </div>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #e8e8f0 0%, var(--accent-light) 50%, var(--success) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          My Todo List
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.95rem' }}>
          {activeCount} task{activeCount !== 1 ? 's' : ''} remaining · {completedCount} completed
        </p>
      </div>

      {/* Card Container */}
      <div style={{
        width: '100%', maxWidth: '620px',
        background: 'var(--bg-card)',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.08)',
        overflow: 'hidden',
      }}>
        {/* Input Form */}
        <form onSubmit={addTodo} style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new task..."
              style={{
                flex: 1, padding: '14px 18px', borderRadius: '12px',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              style={{
                padding: '14px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                color: '#fff', fontWeight: '600', fontSize: '0.95rem',
                boxShadow: '0 4px 16px var(--accent-glow)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px var(--accent-glow)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 16px var(--accent-glow)'; }}
            >
              + Add
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                color: filter === f ? 'var(--accent-light)' : 'var(--text-secondary)',
                fontWeight: filter === f ? '600' : '400',
                fontSize: '0.875rem', textTransform: 'capitalize',
                borderBottom: filter === f ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'color 0.2s',
                marginBottom: '-1px',
              }}
            >
              {f === 'all' ? `All (${todos.length})` : f === 'active' ? `Active (${activeCount})` : `Done (${completedCount})`}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            margin: '16px 24px 0', padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(255,101,132,0.12)', border: '1px solid rgba(255,101,132,0.3)',
            color: 'var(--danger)', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between',
          }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* Todo List */}
        <div style={{ padding: '16px 24px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
              <p>Loading todos...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.4 }}>
                {filter === 'completed' ? '🏆' : filter === 'active' ? '🎉' : '📝'}
              </div>
              <p style={{ fontSize: '0.95rem' }}>
                {filter === 'completed' ? 'No completed tasks yet.' : filter === 'active' ? 'All tasks done! Great job!' : 'No tasks yet. Add one above!'}
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredTodos.map((todo) => (
                <li key={todo._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    transition: 'border-color 0.2s, transform 0.15s',
                    animation: 'fadeIn 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo._id, todo.completed)}
                    style={{
                      width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, cursor: 'pointer',
                      border: todo.completed ? 'none' : '2px solid rgba(108,99,255,0.4)',
                      background: todo.completed ? 'linear-gradient(135deg, var(--accent), var(--success))' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                      color: '#fff', fontSize: '13px',
                    }}
                  >
                    {todo.completed && '✓'}
                  </button>

                  {/* Title or Edit Input */}
                  {editId === todo._id ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(todo._id); if (e.key === 'Escape') setEditId(null); }}
                      style={{
                        flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid var(--accent)',
                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', padding: '2px 0',
                      }}
                    />
                  ) : (
                    <span style={{
                      flex: 1, fontSize: '0.95rem',
                      color: todo.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      transition: 'color 0.2s',
                      wordBreak: 'break-word',
                    }}>
                      {todo.title}
                    </span>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {editId === todo._id ? (
                      <>
                        <ActionBtn onClick={() => saveEdit(todo._id)} color="var(--success)" title="Save">✓</ActionBtn>
                        <ActionBtn onClick={() => setEditId(null)} color="var(--text-secondary)" title="Cancel">✕</ActionBtn>
                      </>
                    ) : (
                      <>
                        <ActionBtn onClick={() => startEdit(todo)} color="var(--accent-light)" title="Edit">✏</ActionBtn>
                        <ActionBtn onClick={() => deleteTodo(todo._id)} color="var(--danger)" title="Delete">🗑</ActionBtn>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Clear Completed */}
          {completedCount > 0 && filter !== 'active' && (
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <button
                onClick={async () => {
                  const completed = todos.filter((t) => t.completed);
                  await Promise.all(completed.map((t) => axios.delete(`${API_URL}/${t._id}`)));
                  setTodos(todos.filter((t) => !t.completed));
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '0.8rem',
                  textDecoration: 'underline', transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                Clear {completedCount} completed
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: var(--text-secondary); }
      `}</style>
    </main>
  );
}

function ActionBtn({ onClick, color, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '30px', height: '30px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        background: 'transparent', color, fontSize: '0.85rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s, transform 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.transform = 'scale(1.15)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}
