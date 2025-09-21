
import Tabs from '@/components/tabs'
import EmptyState from '@/components/emptyState'

export default function InboxAll() {
    return (
        <>
            <Tabs />
            <div className="mt-8">
                <EmptyState text="还没有任何会话哦～" />
            </div>
        </>
    )
}
