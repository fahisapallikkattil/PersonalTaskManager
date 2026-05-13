# **App Name**: PrimeTask

## Core Features:

- User Authentication: Secure sign-up, login, and logout functionality using email and password, powered by Firebase Authentication.
- Personal Task Creation: Logged-in users can create new tasks with title, description, priority (low/medium/high), due date, and automatically assigned creation timestamp.
- Task Viewing & Management: View a list of all personal tasks, filtered and sortable, with indicators for completion status.
- Task Editing & Deletion: Users can update details of existing tasks or delete tasks they no longer need.
- Firestore Database Integration: All task data (title, description, priority, dueDate, isCompleted, createdAt, userId) is securely stored and retrieved from Firestore, ensuring data privacy per user.
- AI Task Description Suggester: An AI tool that suggests relevant and more detailed task descriptions based on the task title provided by the user, speeding up task entry.
- Responsive Dashboard UI: A clean, intuitive dashboard displaying the task list, a form for adding new tasks, and inline controls for editing and deleting tasks, adapting to various screen sizes.

## Style Guidelines:

- Light scheme. Primary: A calm, professional blue (#338ECC). Background: A very light, desaturated blue (#EEF3F5) to maintain focus and clarity. Accent: A vibrant teal (#4DD1D1) for interactive elements and highlights, providing a refreshing contrast.
- Headlines and body font: 'Inter' (sans-serif), chosen for its modern, clean, and highly readable design, ensuring clarity across all task details and interface elements.
- Use a set of simple, clear, and modern line icons for actions like add, edit, delete, and completion status, to maintain a clean visual language.
- A minimalist and organized layout focusing on content hierarchy and readability. Information density should be moderate to prevent user fatigue, with clear visual separation between tasks and actions. Responsive design is paramount to ensure usability across desktops, tablets, and mobile devices.
- Subtle and functional micro-animations for task status changes (e.g., completion toggle), form submissions, and navigational transitions to provide immediate feedback and enhance user experience without distraction.