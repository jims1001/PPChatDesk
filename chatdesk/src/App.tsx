
import { Routes, Route, Navigate } from 'react-router-dom'
import SupportInboxLayout from '@/components/layout'
import InboxMy from '@/pages/inbox/my'
import InboxUnassigned from '@/pages/inbox/unassigned'
import InboxAll from '@/pages/inbox/all'
import InboxMentions from '@/pages/inbox/mentions'
import Contacts from '@/pages/contacts'
import Reports from '@/pages/reports'
import Activities from '@/pages/activities'
import Help from '@/pages/help'
import Settings from '@/pages/settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SupportInboxLayout />}>
        <Route index element={<Navigate to="/inbox/my" replace />} />
        <Route path="inbox">
          <Route index element={<Navigate to="my" replace />} />
          <Route path="my" element={<InboxMy />} />
          <Route path="unassigned" element={<InboxUnassigned />} />
          <Route path="all" element={<InboxAll />} />
          <Route path="mentions" element={<InboxMentions />} />
        </Route>
        <Route path="contacts" element={<Contacts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="activities" element={<Activities />} />
        <Route path="help" element={<Help />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/inbox/my" replace />} />
      </Route>
    </Routes>
  )
}
