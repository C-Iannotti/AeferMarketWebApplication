import {
    useNavigate
} from 'react-router-dom'

export const withWrapper = Component => {
    const Wrapper = props => {
        return (
            <Component
                navigate={useNavigate()}
            />
        );
    };
    return Wrapper;
}