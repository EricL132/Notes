import './Home.css';
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
export default function Home(props) {
    const [loggedIn, setLoggedIn] = useState(false)
    const [tasks, settasks] = useState()
    const [showCreate, setShowCreate] = useState(false)
    const [hoveritem, sethoveritem] = useState()
    const [selecteditem, setselecteditem] = useState()
    const [errormessage, seterrormesssage] = useState()
    const [editting, seteditting] = useState(false)
    function checkForLogin() {
        fetch("/api/auth").then(async (res) => {
            if (res.ok) {
                const data = await res.json()
                settasks(data.tasks)
                setLoggedIn(true)
            }
        })
    }
    function handleLogin(e) {
        e.preventDefault()
        seterrormesssage()
        const username = document.getElementById("username").value
        const password = document.getElementById("password").value
        fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: username, password: password }) }).then(async (res) => {
            if (res.ok) {
                checkForLogin()
            } else {
                const mes = await res.json()
                seterrormesssage(mes.status)
            }
        })
    }
    function handleCreatePost(e) {
        e.preventDefault()
        const title = document.getElementById("title").value
        const description = document.getElementById("description").value

        fetch("/api/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title, description: description }) }).then((res) => res.json()).then((data) => {
            settasks(data.tasks)
            setShowCreate(false)
        })
    }
    useEffect(() => {
        checkForLogin()
    }, [loggedIn])

    function handleSelected(e) {
        seterrormesssage()
        const currentSelected = document.getElementsByClassName("selected")
        if (currentSelected.length > 0) {
            currentSelected[0].classList.remove("selected")
        }
        e.target.classList.add("selected")
        setselecteditem(e.target.getAttribute("task"))
    }

    function handleHover(e) {
        sethoveritem(e.target.getAttribute("task"))
    }

    function handleLogout(e) {
        fetch('/api/logout', { method: "POST" }).then(() => window.location.reload())
    }

    function handleEdit(e) {
        e.preventDefault()
        seterrormesssage()
        const taskID = tasks[selecteditem].id
        const title = document.getElementById("title").value
        const desc = document.getElementById("description").value
        fetch('/api/edit', { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ id: taskID, title: title, description: desc }) }).then((res) => {
            if (res.ok) {

                tasks[selecteditem].title = title
                tasks[selecteditem].description = desc
                setShowCreate(false)
                seteditting(false)
            } else {
                return res.json()
            }

        }).then((data) => {
            if (data) {
                seterrormesssage(data.status)
                setShowCreate(false)
                seteditting(false)
            }
        })
    }


    function deleteNote(e) {
        if (!selecteditem) return seterrormesssage("No Item Selected")
        const taskID = tasks[selecteditem].id
        fetch("/api/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: taskID }) }).then((res) => {
            if (!res.ok) return res.json()
            setselecteditem()
            settasks(tasks.filter((task) => {
                return task.id !== taskID
            }))
        }).then((data) => {
            if (data) {
                seterrormesssage(data.status)
            }
        })
    }
    return (
        <>
            {!loggedIn ?
                <div className="App">
                    <div id="login-container">

                        <form onSubmit={handleLogin} style={{display:"flex",flexDirection:"column",alignItems:"center"}} >
                            <input id="username" autoComplete="off" spellCheck={false} name="username" placeholder="Username"></input>
                            <input autoComplete="off" id="password" type="password" name="password" placeholder="Password"></input>
                            <button className="blue-buttons" style={{ width: "150px" }} onClick={handleLogin}>Login</button>

                        </form>


                        <Link to="register">
                            <button className="blue-buttons">Create Account</button>
                        </Link>
                        <div><span>{errormessage}</span></div>
                    </div>


                </div>
                : <div className="App">
                    {showCreate ?
                        <div id="whole-container" onMouseDown={(e) => e.target === document.getElementById("whole-container") ? setShowCreate(false) : null}>
                            <div id="create-container">
                                <form id="create-form">
                                    <label>Title</label>
                                    {!editting ? <input id="title" autoComplete="off" spellCheck={false} placeholder="Title"></input> : <input id="title" autoComplete="off" spellCheck={false} placeholder="Title" defaultValue={tasks[selecteditem].title}></input>}
                                    <label>Description</label>
                                    {!editting ? <textarea id="description" name="description" autoComplete="off" spellCheck={false} placeholder="Description"></textarea> : <textarea id="description" name="description" autoComplete="off" spellCheck={false} placeholder="Description" defaultValue={tasks[selecteditem].description}></textarea>}
                                    {/* <div>
                                <label>Completed:</label>
                                    <input name="completed" type="checkbox"></input>
                                </div>
                                */}
                                    {!editting ? <button onClick={handleCreatePost}>Submit</button> : <button onClick={handleEdit}>Edit</button>}
                                </form>

                            </div>
                        </div>

                        : null}
                    {hoveritem ?
                        <div id="hovernote" className="description-box">
                            <span>{tasks[hoveritem].description}</span>
                        </div>
                        : <div id="hovernote" className="description-box" style={{ opacity: "0" }}></div>}


                    <div id="mid-container">
                        <div id="list-container">

                            <ul id="task-list">

                                {tasks.map((task, i) => {
                                    return <div key={i} className="noteslist-container" onMouseOver={handleHover} onMouseLeave={() => { sethoveritem() }} onClick={handleSelected}><li task={i}>{task.title}</li></div>

                                })
                                }
                            </ul>
                        </div>
                        <div style={{ display: "inline-flex" }}>
                            <button onClick={() => setShowCreate(true)} className="blue-buttons">Create Note</button>
                            <button className="blue-buttons" onClick={(e) => {
                                if (selecteditem) {
                                    seteditting(true)
                                    setShowCreate(true)
                                } else {
                                    seterrormesssage("No Item Selected")
                                }
                            }

                            }
                            >Edit Note</button>
                            <button className="blue-buttons" onClick={deleteNote}>Delete Note</button>
                        </div>
                        <button id="logout-button" className="blue-buttons" onClick={handleLogout}>Log Out</button>
                        <span style={{ fontWeight: "bold", position: "absolute", marginTop: "18rem" }}>{errormessage}</span>
                    </div>
                    {selecteditem ?
                        <div id="selected" className="description-box">
                            <span>{tasks[selecteditem].description}</span>
                        </div>
                        : <div id="selected" className="description-box" style={{ opacity: "0" }}></div>}



                </div>
            }
        </>
    );
}