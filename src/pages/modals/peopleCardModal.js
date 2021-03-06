import React, {Component} from 'react';
import {Modal, ModalBody, Badge, Alert, ModalFooter, Button, CardImg} from 'reactstrap';
import { database, auth } from '../../firebase/constants';
import '../home/style.css';
import './viewProjectOrTeamStyle.css';

class PeopleCardModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myTeam: null,
            showRedAlert: false,
            showGreenAlert: false,
            hasRequested: false,
            errorMsg: "Oops! Only team leaders can request users to join their team."

            //myTeamId: this.props.currUser.team,
        };
        this.toggle = this.props.onclick;
        this.writeReqRef = database.child("requests/");
        this.userRef = database.child("users/" + auth().currentUser.uid);
    }

    toggleModal() {
        this.setState({
            hasRequested: false,
            showRedAlert: false,
            showGreenAlert: false,
        });
        this.props.onclick();
    }

    dismiss(color) {
        if (color === "red")
            this.setState({ showRedAlert: false });
        if (color === "green")
            this.setState({ showGreenAlert: false });
    }

    //team owner to request a user
    request() {
        //to make a request
        //CHECK if the user has created a team as a team leader
        console.log(this.props.currUser);
        let teamId = this.props.currUser.team;
        let uidForUserToRequest = this.props.obj.id;
        if (!teamId) {
            this.setState({showRedAlert: true});
            return;
        }

        if (uidForUserToRequest === auth().currentUser.uid) {
            this.setState({
                errorMsg: "Oops! Users cannot request themselves.",
                showRedAlert: true,
            });
            return;
        }

        //get your team info
        //once you have the team name, write it and the id to the request table for this user
        database.child("teams/" + teamId).once("value").then((sp) => {
            if (sp.exists()) {
                let teamName = sp.val().name;

                //check if person i am requesting to join my team is already a member of my team
                let teamsCurrMembers = sp.val().members;
                if (teamsCurrMembers && teamsCurrMembers[uidForUserToRequest]) {
                    this.setState({
                        errorMsg: "Oops! This person is already in your team",
                        hasRequested: true,
                        showRedAlert: true,
                    });
                    return;
                }

                //check if i've already requested this user
                let postRequestToUser = database.child("requests/users/" + uidForUserToRequest);
                postRequestToUser.child(teamId).once("value").then((s) => {
                    if (s.exists()) {
                        this.setState({
                            errorMsg: "Oops! You've already requested this user.",
                            showRedAlert: true,
                            hasRequested: true,
                        });
                        return;
                    }
                    else {
                        postRequestToUser.child(teamId).set(teamName);
                        this.setState({
                            showGreenAlert: true,
                            hasRequested: true,
                        });

                    //TODO Delete user from your team's list of interested users
                    }
                });
            }
        });
    }

    render() {
        return (
            <Modal isOpen={this.props.show} toggle={this.toggle} className={this.props.className}>
               
                <ModalBody>
                        <div className="introCard">
                            <CardImg top width = "100%" src={this.props.obj.profilePicture}/>
                            <h1 className="name">{this.props.obj.name}</h1>
                            <h2 className="info">{this.props.obj.bio}</h2>
                            
                            <Alert color="danger" isOpen={this.state.showRedAlert} toggle={() => this.dismiss("red")}>
                                {this.state.errorMsg}
                            </Alert>
                            <Alert color="success" isOpen={this.state.showGreenAlert} toggle={() => this.dismiss("green")}>
                                Nice! You've successfully requested this team.
                            </Alert>

                            <button 
                                className="button" 
                                color="secondary"
                                onClick={() => this.request()}
                                disabled={this.state.hasRequested}
                                block
                            >
                                Request This User To Join Your Team
                            </button>


                        </div>

                        <div className="information">
                            <h2 >About Me</h2> <br/>

                            <h5>School</h5>
                            <p className="info">University of Southern California</p>
                            <p className="info">{this.props.obj.school}</p>

                            <h5>Skills</h5>
                            {this.props.obj.skills &&
                            <div className="container">
                                {Object.keys(this.props.obj.skills).map((k, i) =>
                                    <h5 key={i} className="d-inline-block">
                                        <Badge
                                            key={i}
                                            id={"skillBadge"}
                                            color="primary"
                                        >
                                            {this.props.obj.skills[k]}
                                        </Badge>
                                    </h5>
                                )}
                            </div>}

                            <h5>Interests</h5>
                            {this.props.obj.interests &&
                            <div className="container">
                                {Object.keys(this.props.obj.interests).map((k, i) =>
                                    <h5 key={i} className="d-inline-block">
                                        <Badge
                                            key={i}
                                            id={"skillBadge"}
                                            color="primary"
                                        >
                                            {this.props.obj.interests[k]}
                                        </Badge>
                                    </h5>
                                )}
                            </div>}

                            <h5>Email</h5>
                            <p className="info">{this.props.obj.email}</p>

                            <h5>Links</h5>
                            <p>Facebook</p>
                            <p className="info">{this.props.obj.facebook}</p>
                            <p>GitHub</p>
                            <p className="info">{this.props.obj.github}</p>
                            <p>linkedIn</p>
                            <p className="info">{this.props.obj.linkedIn}</p>
                        </div>

                        <div className="description">
                            <h2 >Experience</h2> 
                            
                            <div className="container">
                              <p>{this.props.obj.description}</p>
                            </div> <br/>
                        </div>

                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => this.toggleModal()}>Close</Button>
                </ModalFooter>
            </Modal>
        );
    }
}
export default PeopleCardModal;