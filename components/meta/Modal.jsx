import React, { Component } from 'react';
import Login from '../auth/Login';
import Register from '../auth/Register';
import { Query } from 'react-apollo';
import { hideModal, clearError, renderModal, setNumNotifications } from '../../apollo/clientWrites';
import Likers from '../posts/Likers';
import { GET_MODAL, NOTIFICATIONS, CURRENT_USER } from '../../apollo/queries';
import Confirm from './Confirm';
import Notifications from '../global/Notifications';
import { NEW_COMMENT, NEW_POST, NEW_LIKE, NEW_REPLY, NEW_COMMENT_LIKE, NEW_FOLLOWER } from '../../apollo/subscriptions';
import NotificationManager from '../../apollo/notificationManager';


const dismiss = (confirmation = false) => {
    renderModal({ confirmation })
    clearError()
}
class Modal extends Component {
    componentDidMount() {
        const { client } = this.props;
        this.manager = new NotificationManager(client)
        const modal = this;
        this.watchForUser = client.watchQuery({ query: CURRENT_USER })
            .subscribe({
                next({ data }) {
                    if (data && data.user) {
                        const { id } = data.user
                        modal.manager.generate(id).subscribe()
                    }
                    else {
                        modal.manager.unsubscribe()
                    }
                }
            })
    }
    componentWillUnmount() {
        this.manager.unsubscribe()
    }
    render() {
        const getDisplay = (display, info) => {
            if (info) {
                info = JSON.parse(info)
            }
            const displays = {
                Login: <Login onComplete={dismiss} />,
                Register: <Register onComplete={dismiss} />,
                Likers: <Likers info={info} />,
                Confirm: <Confirm info={info || {}} />,
            }
            return displays[display]
        }
        return (
            <Query query={GET_MODAL} ssr={false}>
                {({ data }) => {
                    if (!data) return <div></div>;
                    const { active, message, display, info } = data.modal
                    return (
                        <div className={`modal ${active && 'is-active'}`}>
                            <div className="modal-background" onClick={() => dismiss(false)}></div>
                            <div className="modal-card">
                                <header className="modal-card-head has-text-centered has-background-primary">
                                    <p className="modal-card-title has-text-white font-2">{message || display}</p>
                                    <button className="delete" aria-label="close" onClick={() => dismiss(false)}></button>
                                </header>
                                <section className="modal-card-body has-text-centered">
                                    <Query query={NOTIFICATIONS} ssr={false}  >
                                        {({ data, loading, error }) => {
                                            if (error) console.log(error);
                                            if (loading || error) return <div>loading</div>;
                                            if (!data || !data.notifications) return <Notifications data={[]} lastVisited={null} active={display === 'Notifications'} />;
                                            if (data && data.notifications) {
                                                this.manager.store(data.notifications)
                                                return <Notifications data={this.manager.allNotifications} notificationMap={this.manager.notificationMap} lastVisited={data.notifications.lastVisited} active={display === 'Notifications'} />
                                            }
                                            return <div></div>
                                        }}
                                    </Query>
                                    {display === 'Notifications' ? null : getDisplay(display, info)}
                                </section>
                                <footer className="modal-card-foot has-text-centered has-background-primary">
                                </footer>
                            </div>
                        </div>
                    )
                }}
            </Query>
        );
    }
}

export default Modal;
