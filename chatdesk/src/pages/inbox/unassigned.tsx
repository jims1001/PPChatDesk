import Tabs from '@/components/tabs'
import EmptyState from '@/components/emptyState'

export default function InboxUnassigned() {
    return (
        <>
            <Tabs />
            <div className="mt-8">
                <EmptyState text="暂无未分配的对话。" />
            </div>
        </>
    )
}