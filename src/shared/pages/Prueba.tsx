
import { LoadingScreen, NotFoundScreen, EmptyScreen, ForbiddenScreen } from "../components";

const PagePrueba = () => {
    return (
        <div className="center" style={{ display: 'flex', gap: 10, flex: 1, height: '100%' }} >
            <LoadingScreen size="md" />
            <NotFoundScreen onRetry={() => {}} />
            <EmptyScreen size="md" />
            <ForbiddenScreen />
        </div>
    )
}

export default PagePrueba;