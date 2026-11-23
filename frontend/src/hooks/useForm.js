import { useState } from 'react';

// Small form helper: field('email') returns the props an <Input> needs (name, value, onChange, error).
export const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    // Clear a field's error as soon as the user edits it.
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const field = (name) => ({ name, value: values[name], onChange: handleChange, error: errors[name] });

  return { values, setValues, errors, setErrors, field };
};
