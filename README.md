<div align=center>
<span style="font-size:30px;">twitch_xs</span><br>
<img alt="langs" src="https://github-readme-stats.vercel.app/api/top-langs/?username=Ix-xs&langs_count=5&custom_title=Languages&title_color=2986cc&text_color=2986cc&icon_color=2986cc&show_icons=true&theme=tokyonight&hide_border=true&border_radius=10">
<br>
Twitch_xs est une bibliothèque <b>JavaScript</b>/<b>TypeScript</b> qui facilite l'utilisation de l'<b>API Twitch</b> pour l'obtention d'<b>app tokens</b>. Elle vous permet d'interagir avec l'<b>API Twitch</b> de manière simplifiée pour effectuer des requêtes et récupérer des données spécifiques. Cette bibliothèque est conçue pour une utilisation avec des <b>app tokens</b>, vous permettant ainsi d'accéder à certaines fonctionnalités de l'<b>API Twitch</b> en tant qu'application <b>sans nécessiter l'authentification d'un utilisateur</b>. Elle fournit des méthodes et des fonctionnalités pour générer des <b>app tokens</b>, effectuer des requêtes d'API, récupérer des informations sur les utilisateurs, les chaînes, les diffusions en direct, les jeux, etc. <b>twitch_xs</b> est une solution pratique pour les développeurs souhaitant intégrer l'<b>API Twitch</b> dans leurs applications ou services avec des <b>app tokens</b>.

___
<sup>#Not dev</sup> <sup>#Twitch</sup> <sup>#API</sup> <sup>#Read-only<sup>
<br>
</div>

<h2>1. 🗝️Créer une application et récupérer les identifiants</h2>
1.1. Pour créer une application, rendez-vous sur <a href="https://dev.twitch.tv/console">votre console de développement Twitch</a>.<br>
1.2. Dans la partie "Applications", cliquez sur "Enregistrer votre application", puis renseignez les informations demandées (l'url de redirection n'est pas nécessaire pour l'usage de ce package).<br>
1.3. Une fois votre application créée, Récupérez l'<b>Identifiant client</b> et générez un <b>Secret du client</b>, puis, stockez ces deux informations dans un endroit privé.
<br>
<h2>2. ✨Installation</h2>

2.1 `npm install twitch_xs`
<br>
<h2>3. 👀Utilisation</h2>
<h3>3.1. Commencez par instancier un nouveau client en fournissant votre <b>Identifiant client</b> ansi que votre <b>Secret du client</b> :</h3>

```js
const { twitch_xs } = require("twitch_xs");

const client = new twitch_xs({ client_id:"votre_identifiant_client", client_secret:"votre_secret_du_client" });
```

<br>
<h3>3.2. Liste des appels possibles</h3>
<br>

Méthode | options | Description |
| --- | --- | --- |
| `generateToken()` | | Le token est gérer automatiquement mais vous pouvez en générez un nouveau au besoin. Il sera stocké dans un fichier json et sera automatiquement modifier régénérer s'il expire. |
| `isExpiredToken()` | | Renvoi true si le token à expiré, sinon false |
| `refreshToken()` | | Le token est gérer automatiquement mais vous pouvez en générez un nouveau au besoin. Il sera stocké dans un fichier json et sera automatiquement modifier régénérer s'il expire. |
| `getStreams()` | {<br>`users_names?`:string[];<br>`games_names?`:string[];<br>`type?`:string;<br>`languages?`:string[];<br>`first?`:number;<br>`before?`:string;<br>`after?`:string;<br>} | Renvoi les lives en cours. Vide si l'utilisateur ciblé n'est pas en live. |
| `getUsers()` | `usernames`:string[]; | Renvoi les informations des utilisateurs ciblés. |
| `getCheermotes()` | | Renvoi les "cheermotes". |
| `getChatEmotes()` | `username?`:string; | Renvoi la liste globale des emojis ou ceux de l'utilisateur ciblé. |
| `getChatBadges()` | `username?`:string; | Renvoi la liste globale des badges ou ceux de l'utilisateur ciblé. |
| `getChatSettings()` | `username`:string; | Renvoi les informations sur les paramètres du chat de l'utilisateur. |
| `getUsersChatColor()` | `usernames`:string[]; | Renvoi la couleur utilisée par l'utilisateur dans le chat. |
| `getClips()` | `username`:string;<br>{<br>`started_at?`:string;<br>`ended_at`?:string;<br>`first?`:number;<br>`before?`:string;<br>`after?`:string;<br>} | Renvoi un ou plusieurs clips vidéo enregistrés de l'utilisateur ciblé. |
| `getTopGames()` | {<br>`first?`:number;<br>`after?`:string;<br>`before?`:string;<br>} | Renvoi les informations sur tout les jeux. |
| `getGames()` | `gameNames`:string[]; | Renvoi les informations sur les jeux ou catégories spécifiés. |
| `getCurrentSoundTrack()` | `username`:string; | Renvoi les informations sur la track actuelle de l'utilisateur (erreur si l'utilisateur n'a aucune track en cours). |
| `getVideos()` | `username`:string;<br>{<br>`game_name?`:string;<br>`language?`:string;<br>`period?`:string;<br>`sort?`:string;<br>`type?`:string;<br>`first?`:number;<br>`after?`:string;<br>`before?`:string;<br>} | Renvoi les informations sur une ou plusieurs vidéos publiées par l'utilisateur ciblé. |

<br>
<h3>3. Exemples</h3>
<br>


```js
const { twitch_xs } = require("twitch_xs");

const client = new metamob_xs({ client_id:"votre_client_id", client_secret:"votre_secret_client" });

client.getStreams(["twitchdev"]).then(console.log); // Renvoi les lives des utilisateurs ciblé (vide si l'utilisateur ciblé n'est pas en live).

client.getUsers(["twitchdev"]).then(console.log); // Renvoi les informations sur les utilisateurs ciblés.

client.getCheermotes().then(console.log); // Renvoi une liste de tout les monstres.

client.getChatEmotes().then(console.log); // Renvoi la liste global des emojis.
client.getChatEmotes("twitchdev").then(console.log); // Renvoi la liste des emojis de l'utilisateur ciblé.

client.getChatBadges().then(console.log); // Renvoi la liste global des badges.
client.getChatBadges("twitchdev").then(console.log); // Renvoi la liste des badges de l'utilisateur ciblé.

client.getChatSettings("twitchdev").then(console.log); // Renvoi les informations sur les paramètres de chat de l'utilisateur ciblé.

client.getUsersChatColor(["twitchdev"]).then(console.log); // Renvoi la couleur utilisée dans le chat de chaque utilisateur ciblé.

client.getClips("twitchdev").then(console.log); // Renvoi un ou plusieurs clips vidéo enregistrés de l'utilisateur ciblé.

client.getTopGames().then(console.log); // Renvoi les informations sur tout les jeux.
client.getTopGames({ first:1 }).then(console.log); // Renvoi les information sur le top 1 des jeux.

client.getGames(["Fortnite"]).then(console.log); // Renvoi les informations sur les jeux ciblés.

client.getCurrentSoundTrack("twitchdev").then(console.log); // Renvoi les informations sur la track actuelle de l'utilisateur ciblé (erreur si aucune track).
client.getVideos("twitchdev").then(console.log); // Renvoi une liste des vidéos de l'utilisateur ciblé.
```