# Beastz Doc

Beastz-Doc is a minimalist collaborative editing tool designed for seamless teamwork. Built with React and powered by Socket.io, Beastz-Doc offers a straightforward solution for real-time document collaboration.

💻 CodeMirror Integration: Experience a smooth editing experience with CodeMirror, providing advanced features in a simple interface.

👥 Global Collaboration: Enter your username and instantly join the collaborative workspace. There's no limit to the number of users, enabling effortless collaboration with anyone, anywhere.

✨ Simplicity at its Core: Beastz-Doc strips away complexity, focusing solely on the essentials. Just enter your username and start editing – it's that easy.

🌐 Real-Time Updates: Witness changes as they happen with real-time synchronization, ensuring everyone stays on the same page, literally.


###### Architecturally, client-side code communicates via WebSocket with a central server that stores in-memory data structures. This makes the editor very fast, allows us to avoid provisioning a database, and makes testing much easier. The tradeoff is that documents are transient and lost between server restarts