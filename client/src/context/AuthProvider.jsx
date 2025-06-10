import { Children, createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //checks if user is already logged on so we can carry the login session token across reloads
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession ();
            if (error) {
                console.error("Session error: ",  error);
            }
            setUser(session?.user || null);
            setLoading(false);
            }
        getInitialSession();
        
        //add a real-time listener for login/logout/token-refresh to update the local state automatically.
        // This will ensure that the app always reflect on the current auth state
        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setUser(newSession?.user || null);
        });

        //clean up auth state to ensure there are no memory leaks, for example when the app/page reloads
        //
        return () => { 
            listener.subscription.unsubscribe();
        }  
    }, []);

    return (
        <AuthContext.Provider value={{user, loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
