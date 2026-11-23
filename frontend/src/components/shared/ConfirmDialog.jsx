import { Button, Modal } from '../ui';

// Generic "are you sure?" dialog for destructive actions such as removing a member or leaving a group.
export function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', loading = false, onConfirm, onClose }) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" disabled={loading} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
