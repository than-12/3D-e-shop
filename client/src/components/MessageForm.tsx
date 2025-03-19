import React, { useState, useEffect } from 'react';
import { useMessages } from '../hooks/useMessages';
import { useCategories } from '../hooks/useCategories';
import { useNavigate, useParams } from 'react-router-dom';

interface MessageFormProps {
  isEditing?: boolean;
}

const MessageForm: React.FC<MessageFormProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    createMessage, 
    updateMessage, 
    fetchMessage, 
    currentMessage, 
    loading: messageLoading, 
    error: messageError 
  } = useMessages();
  
  const { 
    categories, 
    loading: categoriesLoading 
  } = useCategories();

  // Κατάσταση φόρμας
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: ''
  });
  
  // Κατάσταση σφαλμάτων φόρμας
  const [formErrors, setFormErrors] = useState({
    title: '',
    content: ''
  });
  
  // Κατάσταση υποβολής
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Φόρτωση δεδομένων μηνύματος για επεξεργασία
  useEffect(() => {
    if (isEditing && id) {
      fetchMessage(id);
    }
  }, [isEditing, id, fetchMessage]);

  // Ενημέρωση φόρμας όταν φορτωθεί το μήνυμα
  useEffect(() => {
    if (currentMessage && isEditing) {
      setFormData({
        title: currentMessage.title,
        content: currentMessage.content,
        categoryId: currentMessage.categoryId || ''
      });
    }
  }, [currentMessage, isEditing]);

  // Χειρισμός αλλαγών στα πεδία της φόρμας
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Καθαρισμός σφαλμάτων κατά την πληκτρολόγηση
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Επικύρωση φόρμας
  const validateForm = () => {
    let valid = true;
    const newErrors = { title: '', content: '' };
    
    if (!formData.title.trim()) {
      newErrors.title = 'Ο τίτλος είναι υποχρεωτικός';
      valid = false;
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Το περιεχόμενο είναι υποχρεωτικό';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };

  // Χειρισμός υποβολής φόρμας
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Επικύρωση πριν την υποβολή
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    
    try {
      if (isEditing && id) {
        // Ενημέρωση υπάρχοντος μηνύματος
        const result = await updateMessage(id, formData);
        if (result) {
          setSubmitSuccess('Το μήνυμα ενημερώθηκε επιτυχώς!');
          setTimeout(() => navigate('/messages'), 1500);
        }
      } else {
        // Δημιουργία νέου μηνύματος
        const result = await createMessage(formData);
        if (result) {
          setSubmitSuccess('Το μήνυμα δημιουργήθηκε επιτυχώς!');
          setFormData({ title: '', content: '', categoryId: '' });
          setTimeout(() => navigate('/messages'), 1500);
        }
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Σφάλμα κατά την υποβολή');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Εμφάνιση φόρτωσης
  if ((isEditing && messageLoading) || categoriesLoading) {
    return <div className="loading">Φόρτωση...</div>;
  }

  // Εμφάνιση σφάλματος φόρτωσης
  if (messageError) {
    return <div className="error">Σφάλμα: {messageError}</div>;
  }

  return (
    <div className="message-form-container">
      <h2>{isEditing ? 'Επεξεργασία Μηνύματος' : 'Νέο Μήνυμα'}</h2>
      
      {submitSuccess && (
        <div className="success-message">{submitSuccess}</div>
      )}
      
      {submitError && (
        <div className="error-message">{submitError}</div>
      )}
      
      <form onSubmit={handleSubmit} className="message-form">
        <div className="form-group">
          <label htmlFor="title">Τίτλος*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {formErrors.title && <div className="field-error">{formErrors.title}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="categoryId">Κατηγορία</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">-- Επιλέξτε Κατηγορία --</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Περιεχόμενο*</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            disabled={isSubmitting}
          />
          {formErrors.content && <div className="field-error">{formErrors.content}</div>}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn cancel-btn"
            onClick={() => navigate('/messages')}
            disabled={isSubmitting}
          >
            Ακύρωση
          </button>
          <button 
            type="submit" 
            className="btn submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Αποθήκευση...' : (isEditing ? 'Ενημέρωση' : 'Δημιουργία')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageForm; 