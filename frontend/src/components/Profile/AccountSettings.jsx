import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import api from '../../api';

const AccountSettings = () => {
  const { user, logout } = useUser();
  const [referralInfo, setReferralInfo] = useState(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReferralInfo();
  }, []);

  const fetchReferralInfo = async () => {
    try {
      const response = await api.get('/auth/referral-info');
      setReferralInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch referral info:', error);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivationReason.trim()) {
      setMessage('Please provide a reason for deactivation');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/deactivate-account', { reason: deactivationReason });
      setMessage('Account deactivated successfully');
      setShowDeactivateModal(false);
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to deactivate account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setMessage('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/delete-account', { password: deletePassword });
      setMessage('Account deleted successfully');
      setShowDeleteModal(false);
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralInfo?.referralCode) {
      navigator.clipboard.writeText(referralInfo.referralCode);
      setMessage('Referral code copied to clipboard!');
    }
  };

  return (
    <div className="account-settings">
      <h2>Account Settings</h2>
      
      {/* Account Status */}
      <div className="setting-section">
        <h3>Account Status</h3>
        <div className="status-info">
          <p><strong>Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}</p>
          <p><strong>Phone Verified:</strong> {user?.isPhoneVerified ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Email Verified:</strong> {user?.isEmailVerified ? '✅ Yes' : '❌ No'}</p>
        </div>
      </div>

      {/* Referral System */}
      <div className="setting-section">
        <h3>Referral Program</h3>
        {referralInfo && (
          <div className="referral-info">
            <div className="referral-code-section">
              <p><strong>Your Referral Code:</strong></p>
              <div className="code-display">
                <span className="referral-code">{referralInfo.referralCode}</span>
                <button onClick={copyReferralCode} className="copy-btn">
                  Copy
                </button>
              </div>
            </div>
            
            <div className="referral-stats">
              <p><strong>Total Referrals:</strong> {referralInfo.referralCount}</p>
              <p><strong>Active Rewards:</strong> {referralInfo.referralRewards?.filter(r => !r.isUsed && new Date() < new Date(r.expiresAt)).length || 0}</p>
            </div>

            {referralInfo.referralRewards && referralInfo.referralRewards.length > 0 && (
              <div className="rewards-section">
                <h4>Your Rewards</h4>
                <div className="rewards-list">
                  {referralInfo.referralRewards.map((reward, index) => (
                    <div key={index} className={`reward-item ${reward.isUsed ? 'used' : ''}`}>
                      <div className="reward-info">
                        <span className="reward-type">{reward.type}</span>
                        <span className="reward-amount">৳{reward.amount}</span>
                      </div>
                      <div className="reward-status">
                        {reward.isUsed ? (
                          <span className="status used">Used</span>
                        ) : new Date() > new Date(reward.expiresAt) ? (
                          <span className="status expired">Expired</span>
                        ) : (
                          <span className="status active">Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Actions */}
      <div className="setting-section">
        <h3>Account Actions</h3>
        <div className="action-buttons">
          <button 
            onClick={() => setShowDeactivateModal(true)}
            className="btn-warning"
          >
            Deactivate Account
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="btn-danger"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Deactivate Account</h3>
            <p>Your account will be temporarily deactivated. You can reactivate it by contacting support.</p>
            <textarea
              value={deactivationReason}
              onChange={(e) => setDeactivationReason(e.target.value)}
              placeholder="Please provide a reason for deactivation..."
              rows="3"
            />
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeactivateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeactivateAccount}
                disabled={loading}
                className="btn-warning"
              >
                {loading ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Account</h3>
            <p>This action is permanent and cannot be undone. All your data will be permanently deleted.</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password to confirm"
            />
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={loading}
                className="btn-danger"
              >
                {loading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`message ${message.toLowerCase().includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <style jsx>{`
        .account-settings {
          padding: 2rem;
        }

        .setting-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .setting-section h3 {
          margin-bottom: 1rem;
          color: #333;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 0.5rem;
        }

        .status-info p {
          margin: 0.5rem 0;
          color: #666;
        }

        .referral-code-section {
          margin-bottom: 1rem;
        }

        .code-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .referral-code {
          background: #f8f9fa;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-family: monospace;
          font-weight: bold;
          color: #3730a3;
        }

        .copy-btn {
          background: #3730a3;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .referral-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1rem 0;
        }

        .rewards-section {
          margin-top: 1rem;
        }

        .rewards-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .reward-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 4px;
          border-left: 4px solid #22c55e;
        }

        .reward-item.used {
          opacity: 0.6;
          border-left-color: #6b7280;
        }

        .reward-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .reward-type {
          font-weight: bold;
          text-transform: capitalize;
        }

        .reward-amount {
          color: #22c55e;
          font-weight: bold;
        }

        .status {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: bold;
        }

        .status.active {
          background: #dcfce7;
          color: #166534;
        }

        .status.used {
          background: #f3f4f6;
          color: #374151;
        }

        .status.expired {
          background: #fef2f2;
          color: #dc2626;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .btn-warning {
          background: #f59e0b;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-danger {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
        }

        .modal h3 {
          margin-bottom: 1rem;
        }

        .modal p {
          margin-bottom: 1rem;
          color: #666;
        }

        .modal input,
        .modal textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .message {
          padding: 1rem;
          border-radius: 4px;
          margin-top: 1rem;
          text-align: center;
        }

        .message.success {
          background: #dcfce7;
          color: #166534;
        }

        .message.error {
          background: #fef2f2;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default AccountSettings;
