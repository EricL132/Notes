import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Home from './components/pages/Home/Home'
import Register from './components/pages/Register/Register'
function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Home}></Route>
        <Route path="/register" component={Register}></Route>
      </Switch>
    </Router>
  );
}

export default App;
