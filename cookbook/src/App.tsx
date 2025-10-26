import RecipeCard  from "./components/RecipeCard.tsx";
import testRecipeJson from './json/error-recipe.json' with { type : 'json' }
import Sidebar from "./components/Sidebar.tsx";
import sidebarIcon from './assets/cookbook-icon.svg'
import sidebarIconBlack from './assets/cookbook-icon-black.svg'
import {useCallback, useEffect, useState} from "react";
import type {Recipe} from "./components/interfaces/Recipe.ts";
import About from "./components/about/About.tsx";
import Browse from "./components/Browse.tsx";
import Preheating from "./components/Preheating.tsx";
import NewRecipe from "./components/NewRecipe.tsx";
import {useAuth} from "react-oidc-context";

const testRecipe = testRecipeJson as Recipe

export function App() {
    const auth = useAuth();

    // this currently needs to be manually updated to match the user pool any time it gets recreated, which is not ideal
    // const signOutRedirect = () => {
    //     const clientId = "4beki0cs423atvjm1kr2ojehhu";
    //     const logoutUri = "https://www.azrinsler.com/";
    //     const cognitoDomain = "https://cookbook-login.auth.us-east-1.amazoncognito.com";
    //     window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    // };

    // we'll try caching a few of these in local storage as well, so if the user reloads they don't lose their place
    const [recipeId, setRecipeId] = useState( localStorage.getItem("recipeId") || "0")
    const [sidebarOption, setSidebarOption] = useState( localStorage.getItem("sidebarOption") || "about" )
    const [jokeOption, setJokeOption] = useState("")
    const [data, setData] = useState(testRecipe);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    // sets current mode based on user preference and adds a listener in case they change their mind
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [isDarkMode, setDarkMode] = useState(prefersDarkMode)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        setDarkMode(event.matches)
    });

    const signIn = () => {
        auth.signinRedirect().then(() => {
            window.history.replaceState({}, document.title, window.location.origin)
            setSidebarOption("self")
            window.location.reload()
        })
    }

    const signOut = () => {
        auth.removeUser().then(window.location.reload)
    }

    const refreshOrSetSidebarOption = (option: string) => {
        if (option == sidebarOption) {
            window.location.reload()
        }
        setSidebarOption(option)
    }

    const fetchRecipe = useCallback((recipe: string) => {
        console.log("fetchRecipe(" + recipe + ")")

        setLoading(true)
        setRecipeId(recipe)
        setSidebarOption("recipe");

        localStorage.setItem("recipeId", recipe)
        localStorage.setItem("sidebarOption", "recipe")

        fetch("https://api.azrinsler.com/RecipeApiLambdaPublic", {
            signal: AbortSignal.timeout(120 * 1000),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "operation": "searchById",
                "recipeId": recipe
            })
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((json) => {
                if (json != null) {
                    const jsonData = JSON.parse(json) as Recipe;
                    setData(jsonData);
                    console.log(jsonData);
                    setLoading(false);
                    setError(null)
                }
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false)
            });
    }, []);

    useEffect(() => {
        if (auth.user) {
            if (auth.isAuthenticated) {
                console.log("User is authenticated")
            }
            else {
                console.log("User is not authenticated - attempting silent sign in")
                auth.signinSilent().catch(console.error);
                console.log("Silent sign in completed")
            }
        }
        else {
            console.log("User is not?")
        }
    }, [auth]);


    // I think this should set loading to true and cache our recipe id any time it changes?
    useEffect(() => {
        setLoading(true)
        localStorage.setItem("recipeId", recipeId)
    }, [recipeId]);

    // Also cache sidebarOption in local storage in the same way
    useEffect(() => {
        localStorage.setItem("sidebarOption", sidebarOption)
    }, [sidebarOption]);

    useEffect(() => {
        // this calls a Lambda which has a cold start time and may need a few seconds if it hasn't been used recently
        if (loading && sidebarOption == 'recipe') {
            fetchRecipe(recipeId);
        }
    }, [fetchRecipe, loading, recipeId, sidebarOption]);

    // if (auth.isLoading) {
    //     return <div>Loading...</div>;
    // }
    //
    // if (auth.error) {
    //     return <div>Encountering error... {auth.error.message}</div>;
    // }
        return (
            <>
                <Sidebar
                    icon={<img src={ isDarkMode ? sidebarIcon : sidebarIconBlack } alt='Sidebar Icon'></img>}
                    title={<span style={ isMobile ? { fontSize:"x-large" } : {}}>Simple Recipes</span>}
                    content={[
                        <div style={ isMobile ? { fontSize:"large" } : {} } onClick={ () => { refreshOrSetSidebarOption("about") } }>About</div>,
                        auth.isAuthenticated
                            ? <div style={ isMobile ? { fontSize:"large" } : {} } onClick={ () => { refreshOrSetSidebarOption("new") } }>New Recipe</div>
                            : <></>,
                        auth.isAuthenticated
                            ? <div style={ isMobile ? { fontSize:"large" } : {} } onClick={ () => { refreshOrSetSidebarOption("self") } }>My Recipes</div>
                            : <></>,
                        <div style={ isMobile ? { fontSize:"large" } : {} } onClick={ () => { refreshOrSetSidebarOption("browse") } }>Browse Recipes</div>,
                        <div style={ isMobile ? { fontSize:"large" } : {} } onClick={ () => { refreshOrSetSidebarOption("recipe") } }>Current Recipe</div>,
                        <a   style={ isMobile ? { fontSize:"large" } : {} } href='https://github.com/azrinsler/cloud-resume/tree/main/cookbook'>GitHub</a>,
                        <div style={ isMobile ? { fontSize:"large" } : {} }
                             onMouseLeave={ () => { setJokeOption("") } }
                             onMouseEnter={ () => { setJokeOption("donate") } }>
                            { jokeOption == "donate" ? <>Don't</> : <>Donate</> }
                        </div>,
                        // <div>
                        //     <pre> Hello: {auth.user?.profile.email} </pre>
                        //     <pre> ID Token: {auth.user?.id_token} </pre>
                        //     <pre> Access Token: {auth.user?.access_token} </pre>
                        //     <pre> Refresh Token: {auth.user?.refresh_token} </pre>
                        //     <button onClick={() => auth.removeUser()}>Sign out</button>
                        // </div>,
                        // }
                        // return (
                        //     <>
                        //         <div>
                        //             <button onClick={() => auth.signinRedirect()}>Sign in</button>
                        //             <button onClick={() => signOutRedirect()}>Sign out</button>
                        //         </div>
                        //     </>
                        // );
                        auth.isAuthenticated
                            ? <div style={ isMobile ? { fontSize:"large" } : {} } onClick={ () => { signOut() } }>Sign out</div>
                            : <div style={ isMobile ? { fontSize:"large" } : {} } onClick={ () => { signIn() } }>Login</div>
                        ,
                    ]}
                >
                </Sidebar>
                <div className='flex-column' style={{flexGrow:'1', overflow:'hidden', maxHeight:'100dvh'}}>
                    {
                        sidebarOption == "about"
                            ? <About></About>
                        : sidebarOption == "new"
                            ? auth.isAuthenticated
                                ? <NewRecipe></NewRecipe>
                                : <div style={{width:'100%',textAlign:'center'}}>Use the sidebar to login.</div>
                        : sidebarOption == "browse"
                            ? <Browse recipeCallback={fetchRecipe}></Browse>
                        : sidebarOption == "recipe" && loading
                            ? <Preheating></Preheating>
                        : sidebarOption == "recipe"
                            ? <>
                                <RecipeCard
                                    id={data?.id}
                                    user={data?.user}
                                    title={data?.title}
                                    ingredients={data?.ingredients}
                                    items={data?.items}
                                    steps={data?.steps}>
                                </RecipeCard>
                                { error ? <><p style={{color:'red'}}>{error}</p><p style={{color:'darkgoldenrod'}}>Example Recipe</p></> : <></> }
                            </>
                        : <>Unknown Sidebar Option</>
                    }
                    <div style={{width:'100%',textAlign:'center',color:'red',position:'sticky',bottom:'0'}}>
                        IMPORTANT: Please note that this is a DEV environment - new recipes may be lost any time the DB changes!
                    </div>
                </div>
            </>
        )
}

