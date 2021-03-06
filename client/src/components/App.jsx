import 'react-md/dist/react-md.light_blue-deep_orange.min.css'
import 'react-md/dist/react-md.min.js'
import React, { PureComponent } from 'react';
import { NavigationDrawer, FontIcon, ListItem, Card, CardActions, DialogContainer, TextField, Button, Grid, Cell, CardTitle, CardText } from 'react-md';
import { Route, NavLink, Link, Switch, Redirect, withRouter } from "react-router-dom";
import { withCookies } from 'react-cookie';
import _ from 'lodash'
import MyNavLink from './MyNavLink'

import ProtectedRoute from './ProtectedRoute'

import navItemsMenu from './navItems';

import Persons from './Persons'
import Logout from "./Logout"
import PersonProfile from "./PersonProfile"
import Units from "./Units";
import Unit from "./Unit";

class App extends PureComponent {
  constructor(props) {
    super(props);
    // console.log(this.props);

    const { cookies } = props;

    this.navItems = navItemsMenu;

    this.state = {
      user_name: "",
      password: "",
      dialog_visible: false,
      dialog_text: "",
    };
  }

  connecToServer() {
    fetch('/');
  }

  componentDidMount() {
    this.connecToServer();
  }

  componentDidChange = () => {
    if (this.props.match.path === "/logout") {
      this.props.cookies.remove('user', { path: "/" });
    }

  }

  login = (event) => {
    event.preventDefault();

    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: this.state.user_name, password: this.state.password })
    }).then(response => {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      return response.json();
    }).then(data => {
      if (data.msg === "user_not_exists") {
        this.setState({ login_error_visible: true, login_error_text: "Username or password is incorrect" });
        // console.log("Zadané prihlasovacie meno neexistuje");
      }
      if (data.msg === "multiple_users_with_same_user_name") {
        this.setState({ login_error_visible: true, login_error_text: "Some error occured, more users with same username exist. Please, contact your administrator" });
        // console.log("Z nejakého dôvodu existuje viacero užívateľov s týmto prihlasovacím menom");
      }
      if (data.msg === "wrong_password") {
        this.setState({ login_error_visible: true, login_error_text: "Username or password is incorrect" });
        // console.log("Zadané heslo nie je správne");
      }
      if (data.msg === "err") {
        this.setState({ login_error_visible: true, login_error_text: "Undefined error. Please, contact your administrator." });
        // console.log("Undefined error while login")
        throw data.error;
      }
      if (data.msg === "ok") {
        console.log(data.user);
        this.props.cookies.set('user', data.user, { path: '/' });
        // console.log("ok");
      }
    })
      .catch(err => console.log("Error while fetching user: " + err))

  }

  show = () => {
    this.setState({ dialog_visible: true });
  };

  hide = () => {
    this.setState({ dialog_visible: false });
  };

  render() {

    const { dialog_visible, dialog_message, login_error_text, login_error_visible } = this.state;
    const actions = [];
    actions.push({ secondary: true, children: 'Cancel', onClick: this.hide });


    const { cookies } = this.props;
    if (_.isEmpty(cookies.get('user'))) {
      return (



        // tu by mal yt iba <Login/>, ale vyrenderuje sa bez props, teda aj bez cookies
        <section className="md-text-container md-cell md-cell--4 md-cell--right md-cell--middle" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -70%)',
          background: 'red',
        }}
        >

          <Card className="md-grid md-cel">
            <CardTitle title="Login" />
            <CardText>
              <form className="text-fields__application" onSubmit={this.login.bind(this)}>
                <TextField
                  id="user_name"
                  label="User name"
                  className="md-cell md-cell--12"
                  value={this.state.user_name}
                  onChange={value => this.setState({ user_name: value })}
                  // errorText={login_error_text}
                  error={login_error_visible}
                  required
                />
                <TextField
                  id="password"
                  label="Password"
                  type="password"
                  className="md-cell md-cell--12"
                  value={this.state.password}
                  onChange={value => this.setState({ password: value })}
                  errorText={login_error_text}
                  error={login_error_visible}
                  required
                />
                <CardActions className="md-cell md-cell--12">
                  <Button
                    raised
                    primary
                    type="submit"
                    className="md-cell--center"
                  >
                    Log in
            </Button>
                </CardActions>
              </form>
              <DialogContainer
                id="add-person-confirm-dialog"
                visible={dialog_visible}
                onHide={this.hide}
                actions={actions}
                title={dialog_message}
              >
              </DialogContainer>
            </CardText>
          </Card>
        </section>
      );
    } else {
      return (
        <NavigationDrawer
          navItems={this.navItems.map(
            props => <MyNavLink {...props} key={props.to} />)
          }
          mobileDrawerType={NavigationDrawer.DrawerTypes.TEMPORARY}
          tabletDrawerType={NavigationDrawer.DrawerTypes.PERSISTENT_MINI}
          desktopDrawerType={NavigationDrawer.DrawerTypes.PERSISTENT_MINI}
          // toolbarTitle=""
          contentId="main-demo-content"
          temporaryIcon={<FontIcon>menu</FontIcon>}
          persistentIcon={<FontIcon>arrow_back</FontIcon>}
          contentClassName="md-grid"
        >
          <section className="md-text-container md-cell md-cell--12">
            <Switch>
              <ProtectedRoute path="/" exact render={(props) => (<Logout {...props} cookies={this.props.cookies} />)} />
              <ProtectedRoute path="/profile" render={(props) => (<PersonProfile {...props} cookies={this.props.cookies} />)} />
              <ProtectedRoute path="/persons" exact render={(props) => (<Persons {...props} cookies={this.props.cookies} />)} />
              <ProtectedRoute path="/persons/:id" render={(props) => (<PersonProfile {...props} cookies={this.props.cookies} />)} />
              <ProtectedRoute path="/add-person" exact render={(props) => (<PersonProfile {...props} cookies={this.props.cookies} />)} />
              <ProtectedRoute path="/units" exact render={(props) => (<Units {...props} cookies={this.props.cookies} />)} />
              <ProtectedRoute path="/units/:id" render={(props) => (<Unit {...props} cookies={this.props.cookies} />)} />
              <ProtectedRoute path="/add-unit" exact render={(props) => (<Unit {...props} cookies={this.props.cookies} />)} />
              <ProtectedRoute path="/logout" exact render={(props) => (<Logout {...props} cookies={this.props.cookies} />)} />
            </Switch>
          </section>
        </NavigationDrawer>
      );
    }
  }
}

export default withRouter(withCookies(App));
