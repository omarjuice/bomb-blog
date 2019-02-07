import React, { Component } from 'react';
import marked from 'marked'
import { setSearch } from '../apollo/clientWrites';
const renderer = new marked.Renderer()
marked.setOptions({
    breaks: true,
    sanitize: true
});
class New extends Component {
    static getInitialProps() {
        setSearch({ active: false })
        return {}
    }
    render() {
        return (
            <div className="markdown-body" dangerouslySetInnerHTML={{
                __html: marked.parse(`# Hangman (client)\n## A multiplayer chat app and hangman game.
                \nPlayers can play hangman and chat with anyone and anywhere.
                \nThis web app is mobile responsive. It uses the Oxford Dictionary and Urban Dictionary APIs.
                \n## User Experience
                
                \nAt the join page, a user can enter a username and a room they would like to enter. If a room of the chosen name does not exist, the user will be asked to choose a dictionary for that room. Then users will be taken to a room where they can chat, and if there are at least 2 players, play hangman.
                
                \n## GamePlay
                 \nIn the Urban or Oxford Dictionary rooms, players can choose a word and the app will choose a hint for them. In the Free-For-All rooms, players make their own hints. The max number of players per room is capped at 5.
                
                \nPlayers get 60 seconds per turn and 5 incorrect guesses. For each correct letter, the player is awarded 1 point. Meaning partial credit even if the word is not complete. If the word is not completely guessed, the word-picker is awarded 5 points.
                \nThe players take turns choosing words, and word choosers do not partake in the game that they choose for.
                
                \n### Made with Socket.io, Node, React, Redux, and AnimeJS.
                
                \n[Server code](https://github.com/OmarJuice/Hangman-server)`, { renderer })
            }}>

            </div>
        );
    }
}

export default New;
