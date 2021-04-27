
import './Register.css';
import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../Home/Home.css'

export default function CreateTask(props) {
    const [formData, setFormData] = useState({
        user: "",
        password: "",
    })

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value.trim() })
    }

    function CreateAccount(e) {
        e.preventDefault()
        fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: formData.user, password: formData.password }) }).then((res) => {
            if (res.ok) {
                props.history.push("/")
            }
            return res.json()
        }).then((data) => {
            console.log(data)
        })
    }
    return (
        <div className="App" style={{ display: "flex", flexDirection: "column" }}>

            <form onSubmit={CreateAccount} autoComplete="off">
                <div style={{ display: "flex", flexDirection: "column",alignItems:"center" }}>
                    <input name="user" placeholder="Username" onChange={handleFormChange} ></input>
                    <input autoComplete="off" type="password" name="password" placeholder="Password" onChange={handleFormChange} ></input>
                    <button className="blue-buttons" style={{width:"100px"}}>Submit</button>
                </div>
            </form>
            <Link to="/">
                <button className="blue-buttons">Back</button>
            </Link>


        </div>

    );
}