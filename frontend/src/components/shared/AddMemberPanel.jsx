import { useEffect, useState } from 'react';
import { searchStudents } from '../../api/students.api';
import { useDebounce } from '../../hooks/useDebounce';
import { getErrorMessage } from '../../utils/errors';
import { Button, Input } from '../ui';

const MIN_SEARCH_LENGTH = 2;

// Search for students who have no group yet (by name, email or student ID) and add them.
// `refreshKey` changes after each add, so the list drops students who just joined.
export function AddMemberPanel({ onAdd, addingId, refreshKey }) {
  const [search, setSearch] = useState('');
  // The last finished search: which text it was for, and what came back.
  const [result, setResult] = useState({ query: '', students: [], error: '' });
  const debouncedSearch = useDebounce(search.trim(), 300);
  const isSearchable = debouncedSearch.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (!isSearchable) return;

    let ignore = false;

    searchStudents(debouncedSearch)
      .then((students) => !ignore && setResult({ query: debouncedSearch, students, error: '' }))
      .catch((error) => !ignore && setResult({ query: debouncedSearch, students: [], error: getErrorMessage(error) }));

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, isSearchable, refreshKey]);

  const searching = isSearchable && result.query !== debouncedSearch;
  const students = isSearchable ? result.students : [];

  return (
    <div>
      <Input
        label="Add a teammate"
        placeholder="Search by name, email or student ID"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        hint="Only students who are not in a group yet are shown."
      />

      {searching && <p className="mt-3 text-sm text-slate-500">Searching...</p>}
      {!searching && isSearchable && result.error && <p className="mt-3 text-sm text-red-600">{result.error}</p>}

      {!searching && isSearchable && !result.error && students.length === 0 && (
        <p className="mt-3 text-sm text-slate-500">No available students match &quot;{debouncedSearch}&quot;.</p>
      )}

      {!searching && students.length > 0 && (
        <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {students.map((student) => (
            <li key={student.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{student.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {student.studentId} · {student.email}
                </p>
              </div>
              <Button size="sm" loading={addingId === student.id} onClick={() => onAdd(student)}>
                Add
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
