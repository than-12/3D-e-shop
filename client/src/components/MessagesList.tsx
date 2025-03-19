import React from 'react';
import { useMessages } from '../hooks/useMessages';
import { useCategories } from '../hooks/useCategories';

const MessagesList: React.FC = () => {
  const { 
    messages, 
    loading: messagesLoading, 
    error: messagesError, 
    deleteMessage 
  } = useMessages();
  
  const { 
    categories, 
    loading: categoriesLoading 
  } = useCategories();

  // Χειρισμός διαγραφής μηνύματος
  const handleDelete = async (id: string) => {
    if (window.confirm('Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το μήνυμα;')) {
      const success = await deleteMessage(id);
      if (success) {
        // Εμφάνιση μηνύματος επιτυχίας ή άλλη ενέργεια
        alert('Το μήνυμα διαγράφηκε επιτυχώς.');
      }
    }
  };

  // Εμφάνιση φόρτωσης
  if (messagesLoading || categoriesLoading) {
    return <div className="loading">Φόρτωση...</div>;
  }

  // Εμφάνιση σφάλματος
  if (messagesError) {
    return <div className="error">Σφάλμα: {messagesError}</div>;
  }

  // Εμφάνιση κενής λίστας
  if (messages.length === 0) {
    return <div className="empty">Δεν υπάρχουν μηνύματα.</div>;
  }

  // Εύρεση ονόματος κατηγορίας από το ID
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Χωρίς κατηγορία';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Άγνωστη κατηγορία';
  };

  // Φορμάτ ημερομηνίας
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="messages-list">
      <h2>Λίστα Μηνυμάτων</h2>
      
      {messages.map((message) => (
        <div key={message.id} className="message-card">
          <h3>{message.title}</h3>
          <div className="message-meta">
            <span className="author">
              Από: {message.user?.name || 'Άγνωστος'}
            </span>
            <span className="category">
              Κατηγορία: {getCategoryName(message.categoryId)}
            </span>
            <span className="date">
              {formatDate(message.createdAt)}
            </span>
          </div>
          <p className="message-content">{message.content}</p>
          <div className="message-actions">
            <button 
              className="btn edit-btn"
              onClick={() => window.location.href = `/messages/edit/${message.id}`}
            >
              Επεξεργασία
            </button>
            <button 
              className="btn delete-btn"
              onClick={() => handleDelete(message.id)}
            >
              Διαγραφή
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessagesList; 