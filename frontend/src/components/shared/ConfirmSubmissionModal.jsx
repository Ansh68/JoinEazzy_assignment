import { useState } from 'react';
import toast from 'react-hot-toast';
import { confirmSubmission } from '../../api/assignments.api';
import { getErrorMessage } from '../../utils/errors';
import { Button, Modal } from '../ui';

// Two-step verification: first "Yes, I have submitted", then a final "Confirm submission".
// Mount it with key={assignment.id} so it always starts on step 1.
export function ConfirmSubmissionModal({ assignment, groupName, onClose, onConfirmed }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await confirmSubmission(assignment.id);
      toast.success('Submission confirmed for your group');
      onConfirmed();
    } catch (error) {
      toast.error(getErrorMessage(error));
      // The group may already be confirmed by a teammate, so refresh either way.
      onConfirmed();
    }
  };

  if (step === 1) {
    return (
      <Modal
        open
        onClose={onClose}
        title="Have you submitted your work?"
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Not yet
            </Button>
            <Button onClick={() => setStep(2)}>Yes, I have submitted</Button>
          </>
        }
      >
        Upload your group&apos;s files to the OneDrive link for <strong>{assignment.title}</strong> first, then confirm here.
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={submitting ? () => {} : onClose}
      title="Confirm submission"
      footer={
        <>
          <Button variant="secondary" disabled={submitting} onClick={() => setStep(1)}>
            Go back
          </Button>
          <Button loading={submitting} onClick={handleConfirm}>
            Confirm submission
          </Button>
        </>
      }
    >
      This marks <strong>{assignment.title}</strong> as submitted for your whole group{groupName ? ` (${groupName})` : ''}. It cannot be undone.
    </Modal>
  );
}
