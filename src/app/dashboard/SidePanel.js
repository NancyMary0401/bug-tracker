import React, { useState } from 'react';
import styles from './SidePanel.module.css';
import { users } from '../../../models/users';

export default function SidePanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    assignee: '',
    dueDate: '',
    estimatedTime: '',
    effort: '',
    type: 'Bug',
    project: '',
  });
  const [assigneeInput, setAssigneeInput] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAssigneeInput = (e) => {
    setAssigneeInput(e.target.value);
    setForm({ ...form, assignee: e.target.value });
    setShowAssigneeDropdown(true);
  };

  const handleAssigneeSelect = (username) => {
    setForm({ ...form, assignee: username });
    setAssigneeInput(username);
    setShowAssigneeDropdown(false);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(assigneeInput.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const createdAt = new Date().toISOString();
    onSubmit({ ...form, createdAt });
  };

  return (
    <div className={styles.sidePanelOverlay}>
      <div className={styles.sidePanel}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2>Create Task / Bug</h2>
        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <label>Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label>Description
            <textarea name="description" value={form.description} onChange={handleChange} required />
          </label>
          <label>Priority
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </label>
          <label>Status
            <input name="status" value={form.status} disabled />
          </label>
          <label style={{ position: 'relative' }}>Assignee
            <span style={{
              position: 'absolute',
              right: '10px',
              top: '70%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#1976d2',
              fontSize: '1.1em',
              zIndex: 2
            }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="7" stroke="#1976d2" strokeWidth="2"/>
                <line x1="14.4142" y1="14" x2="18" y2="17.5858" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              name="assignee"
              value={assigneeInput}
              onChange={handleAssigneeInput}
              onFocus={() => setShowAssigneeDropdown(true)}
              onBlur={() => setTimeout(() => setShowAssigneeDropdown(false), 100)}
              autoComplete="off"
              required
              style={{ paddingLeft: '3px' }}
            />
            {showAssigneeDropdown && assigneeInput.length >= 3 && filteredUsers.length > 0 && (
              <ul className={styles.typeaheadDropdown}>
                {filteredUsers.map(user => (
                  <li
                    key={user.username}
                    onMouseDown={() => handleAssigneeSelect(user.username)}
                    className={styles.typeaheadOption}
                  >
                    {user.username} ({user.role})
                  </li>
                ))}
              </ul>
            )}
          </label>
          <label>Type
            <select name="type" value={form.type} onChange={handleChange}>
              <option>Bug</option>
              <option>Task</option>
              <option>Feature</option>
            </select>
          </label>
          <label>Due Date
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} min={today} />
          </label>
          <label>Estimated Time (e.g. 2d 4h 3m)
            <input name="estimatedTime" value={form.estimatedTime} onChange={handleChange} />
          </label>
          <div className={styles.buttonRow}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" className={styles.submitButton}>Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
} 