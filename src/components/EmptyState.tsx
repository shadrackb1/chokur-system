import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return React.createElement(
    'div',
    { className: 'flex flex-col items-center justify-center py-16 px-6 text-center bg-surface-panel border border-hairline rounded-sm' },
    icon && React.createElement(
      'div',
      { className: 'w-16 h-16 mx-auto mb-4 bg-surface-container rounded-full flex items-center justify-center text-tertiary' },
      icon
    ),
    React.createElement('h3', { className: 'text-h3 text-primary mb-2' }, title),
    React.createElement('p', { className: 'text-body text-secondary max-w-md mb-6' }, description),
    React.createElement(
      'div',
      { className: 'flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md' },
      action && React.createElement(
        'button',
        {
          onClick: action.onClick,
          className: `w-full sm:w-auto px-4 py-2 rounded-sm font-medium transition-base cursor-pointer ${
            action.variant === 'primary'
              ? 'bg-brand text-inverse hover:bg-brand-hover'
              : 'bg-transparent border border-primary text-primary hover:bg-surface-container-high'
          }`
        },
        action.label
      ),
      secondaryAction && React.createElement(
        'button',
        {
          onClick: secondaryAction.onClick,
          className: 'w-full sm:w-auto px-4 py-2 rounded-sm font-medium text-secondary hover:text-primary transition-base cursor-pointer bg-transparent'
        },
        secondaryAction.label
      )
    )
  );
}

// SVG icon constants
const UsersIcon = React.createElement(
  'svg',
  { className: 'w-8 h-8', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
  React.createElement('path', {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
  })
);

const EditIcon = React.createElement(
  'svg',
  { className: 'w-8 h-8', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
  React.createElement('path', {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
  })
);

const CalendarIcon = React.createElement(
  'svg',
  { className: 'w-8 h-8', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
  React.createElement('path', {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  })
);

const BookIcon = React.createElement(
  'svg',
  { className: 'w-8 h-8', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
  React.createElement('path', {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
  })
);

const SearchIcon = React.createElement(
  'svg',
  { className: 'w-8 h-8', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
  React.createElement('path', {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    d: 'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  })
);

const WifiOffIcon = React.createElement(
  'svg',
  { className: 'w-8 h-8', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
  React.createElement('path', {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    d: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
  })
);

// Factory functions for empty states
function noStudents(onAddStudent: () => void) {
  return React.createElement(
    EmptyState,
    {
      icon: UsersIcon,
      title: 'No students yet',
      description: 'Add students to start tracking their academic performance. You can add them one by one or import from a CSV file.',
      action: { label: 'Add Student', onClick: onAddStudent, variant: 'primary' },
      secondaryAction: { label: 'Import from CSV', onClick: () => {} }
    }
  );
}

function noMarks(onEnterMarks: () => void) {
  return React.createElement(
    EmptyState,
    {
      icon: EditIcon,
      title: 'No marks entered for this exam',
      description: 'Start entering marks for this exam to see rankings, analysis, and report cards.',
      action: { label: 'Enter Marks', onClick: onEnterMarks, variant: 'primary' }
    }
  );
}

function noExams(onCreateExam: () => void) {
  return React.createElement(
    EmptyState,
    {
      icon: CalendarIcon,
      title: 'No exams created',
      description: 'Create an exam period to start recording marks and generating reports.',
      action: { label: 'Create Exam', onClick: onCreateExam, variant: 'primary' }
    }
  );
}

function noSubjects(onAddSubject: () => void) {
  return React.createElement(
    EmptyState,
    {
      icon: BookIcon,
      title: 'No subjects configured',
      description: 'Add subjects to define the curriculum and enable marks entry.',
      action: { label: 'Add Subject', onClick: onAddSubject, variant: 'primary' }
    }
  );
}

function noResults(searchTerm: string, onClearSearch: () => void) {
  const description = `No records match "${searchTerm}". Try adjusting your search or filters.`;
  return React.createElement(
    EmptyState,
    {
      icon: SearchIcon,
      title: 'No results found',
      description: description,
      action: { label: 'Clear Search', onClick: onClearSearch, variant: 'secondary' }
    }
  );
}

function offline(onRetry: () => void) {
  return React.createElement(
    EmptyState,
    {
      icon: WifiOffIcon,
      title: "You're offline",
      description: 'Changes will be saved locally and synced when you\'re back online.',
      action: { label: 'Retry Connection', onClick: onRetry, variant: 'primary' }
    }
  );
}

// Pre-defined empty states for common scenarios
export const EmptyStates = {
  noStudents,
  noMarks,
  noExams,
  noSubjects,
  noResults,
  offline,
};