import RecipeCard  from "./components/RecipeCard.tsx";
import errorRecipeJson from './json/error-recipe.json' with { type : 'json' }
import Sidebar from "./components/Sidebar.tsx";
import sidebarIcon from './assets/cookbook-icon.svg'
import sidebarIconBlack from './assets/cookbook-icon-black.svg'
import {useCallback, useEffect, useState} from "react";
import type {Recipe} from "./components/interfaces/Recipe.ts";
import About from "./components/about/About.tsx";
import Browse from "./components/Browse.tsx";
import Preheating from "./components/Preheating.tsx";
import {useAuth} from "react-oidc-context";
import MyRecipes from "./components/MyRecipes.tsx";
import SaveRecipe from "./components/SaveRecipe.tsx";
import Resume from "./components/about/Resume.tsx";

const errorRecipe = errorRecipeJson as Recipe

export function App() {
    const auth = useAuth();

    // this currently needs to be manually updated to match the user pool any time it gets recreated, which is not ideal
    const signOutRedirect = () => {
        const clientId = "4beki0cs423atvjm1kr2ojehhu";
        const logoutUri = "https://www.azrinsler.com/";
        const cognitoDomain = "https://cookbook-login.auth.us-east-1.amazoncognito.com";
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    // we'll try caching a few of these in local storage as well, so if the user reloads they don't lose their place
    const [recipeId, setRecipeId] = useState( localStorage.getItem("recipeId") || "0")
    const [sidebarOption, setSidebarOption] = useState( localStorage.getItem("sidebarOption") || "about" )
    const [jokeOption, setJokeOption] = useState("")
    const [data, setData] = useState(errorRecipe);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    // sets the current mode based on user preference and adds a listener in case they change their mind
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [isDarkMode, setDarkMode] = useState(prefersDarkMode)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        setDarkMode(event.matches)
    });

    const signIn = () => {
        console.log("signIn()")
        localStorage.setItem("sidebarOption", "self")
        auth.signinRedirect()
    }

    const signOut = () => {
        console.log("signOut()")
        auth.removeUser()
        console.log("auth.removeUser()")
        signOutRedirect()
        console.log("signOutRedirect()")
        // auth.signoutRedirect()
        // console.log("auth.signoutRedirect()")
    }

    const refreshOrSetSidebarOption = (option: string) => {
        if (option == sidebarOption) {
            window.location.reload()
        }
        setSidebarOption(option)
    }

    const loadMyRecipe = useCallback((recipe: Recipe) => {
        console.log("Loading recipe from MyRecipes", recipe)
        setData(recipe)
        setLoading(false)
        setSidebarOption("recipe");
        setRecipeId(recipe.recipeId!)
    },[])

    const fetchRecipe = useCallback((recipe: string) => {
        console.log("fetchRecipe(" + recipe + ") - Attempting to fetch recipe by ID")
        setSidebarOption("recipe");
        setLoading(true)

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
                const jsonData = JSON.parse(json) as Recipe
                console.log("Recipe returned", jsonData)
                setData(jsonData)
                setLoading(false)
                setError(null)
                setRecipeId(recipe)
            }
        })
        .catch((err) => {
            setError(err.message);
            setLoading(false)
        });
    }, []);

    // keep local storage in sync with recipeId
    useEffect(() => {
        localStorage.setItem("recipeId", recipeId)
    }, [recipeId]);

    // also keeps the recipe id in sync with any Recipe data object
    useEffect(() => {
        setLoading(false)
        setRecipeId(data.recipeId!)
    }, [data])

    useEffect(() => {
        const inSync = data.recipeId == recipeId
        if (inSync) {
            setLoading(false)
        }
        else {
            setLoading(true)
            setRecipeId(data.recipeId!)
        }
    }, [data.recipeId, recipeId]);

    // additionally, cache sidebarOption in local storage in the same way
    useEffect(() => {
        localStorage.setItem("sidebarOption", sidebarOption)
    }, [sidebarOption]);

    useEffect(() => {
        // this calls a Lambda which has a cold start time and may need a few seconds if it hasn't been used recently
        if (loading && sidebarOption == 'recipe' && data.recipeId != recipeId) {
            console.log(`useEffect about to call fetchRecipe for id: ${recipeId}`)
            fetchRecipe(recipeId);
        }
    }, [data.recipeId, fetchRecipe, loading, recipeId, sidebarOption]);

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
                    auth.isAuthenticated && auth.user?.profile.sub == data.user
                        ? <div style={ isMobile ? { fontSize:"large" } : {} } onClick={ () => { refreshOrSetSidebarOption("edit") } }>Edit Recipe</div>
                        : <></>,
                    auth.isAuthenticated
                        ? <div style={ isMobile ? { fontSize:"large" } : {} } onClick={ () => { refreshOrSetSidebarOption("self") } }>My Recipes</div>
                        : <></>,
                    <div style={ isMobile ? { fontSize:"large" } : {} } onClick={ () => { refreshOrSetSidebarOption("browse") } }>Browse Recipes</div>,
                    <div style={ isMobile ? { fontSize:"large" } : {} } onClick={ () => { refreshOrSetSidebarOption("recipe") } }>Current Recipe</div>,
                    <a   style={ isMobile ? { fontSize:"large" } : {} } href='https://github.com/azrinsler/cloud-resume'>GitHub</a>,
                    <div style={ isMobile ? { fontSize:"large" } : {} }
                         onMouseLeave={ () => { setJokeOption("") } }
                         onMouseEnter={ () => { setJokeOption("donate") } }>
                        { jokeOption == "donate" ? <>Don't</> : <>Donate</> }
                    </div>,
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
                            ? <SaveRecipe recipeCallback={fetchRecipe}></SaveRecipe>
                            : <div style={{width:'100%',textAlign:'center'}}>Use the sidebar to login.</div>
                    : sidebarOption == "edit"
                        ? auth.isAuthenticated && auth.user?.profile.sub == data.user
                            ? <SaveRecipe recipeCallback={fetchRecipe} recipe={data}></SaveRecipe>
                            : <div style={{width:'100%',textAlign:'center'}}>Use the sidebar to login.</div>
                    : sidebarOption == "self"
                        ? auth.isAuthenticated
                            ? <MyRecipes recipeCallback={loadMyRecipe}></MyRecipes>
                            : <div style={{width:'100%',textAlign:'center'}}>Use the sidebar to login.</div>
                    : sidebarOption == "browse"
                        ? <Browse recipeCallback={fetchRecipe}></Browse>
                    : sidebarOption == "recipe" && loading
                        ? <Preheating></Preheating>
                    : sidebarOption == "recipe"
                        ? <>
                            <RecipeCard
                                recipeId={data?.recipeId}
                                user={data?.user}
                                title={data?.title}
                                ingredients={data?.ingredients}
                                items={data?.items}
                                steps={data?.steps}>
                            </RecipeCard>
                            { error ? <><p style={{color:'red'}}>{error}</p><p style={{color:'darkgoldenrod'}}>Example Recipe</p></> : <></> }
                        </>
                    : sidebarOption == "resume"
                        ? <Resume></Resume>
                    : <>Unknown Sidebar Option</>
                }
                <div style={{width:'100%',textAlign:'center',color:'red',position:'sticky',bottom:'0'}}>
                    IMPORTANT: Please note that this is a DEV environment - new recipes may be lost any time the DB changes!
                </div>
            </div>
        </>
    )
}

