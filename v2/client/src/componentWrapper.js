import {
    useNavigate
} from 'react-router-dom'

/* 
 * A wrapper class to allow navigation throughout the React app.
 */
export const withWrapper = Component => {
    const Wrapper = props => {
        return (
            <Component
                navigate={useNavigate()}
                {...props}
            />
        );
    };
    return Wrapper;
}