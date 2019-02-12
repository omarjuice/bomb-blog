const faker = require("faker");
const { hashPW } = require('../db/crypt')
const { database } = require('../config')
const { userSchema, profileSchema, postSchema, likeSchema, commentSchema, commentLikeSchema,
    replySchema, tagSchema, postTagSchema, commentTagSchema, followSchema, userTagSchema } = require('../db/schema')
const { queryDB } = require('../db/connect')
const { randomMarkdown } = require('../markdown')


const seedDB = {
    numUsers: 3,
    numPosts: 3,
    numComments: 3,
    numTags: 11,
    users: [[
        "a@z.com",
        "alpha",
        '1',
    ], [
        "b@y.com",
        "beta",
        '2',
    ], [
        "c@x.com",
        "gamma",
        '3'
    ]],
    usersHashed: [[
        "a@z.com",
        "alpha",
        '1',
    ], [
        "b@y.com",
        "beta",
        '2',
    ], [
        "c@x.com",
        "gamma",
        '3'
    ]],
    profiles: [[
        1,
        "I am a web developer based in City, Country",
        faker.image.avatar(),
    ], [
        2,
        "Kool Kid",
        null
    ], [
        3,
        null,
        faker.image.avatar()
    ]],
    userTags: [[1, 2], [1, 6], [2, 11], [3, 4], [3, 9]],
    follows: [[1, 1], [1, 3], [1, 2], [2, 3], [2, 2], [3, 1], [3, 3]],
    posts: [[
        1,
        "My blog",
        "All the reasons why I am cool",
        faker.date.past(),
        `# Prosternit Quirino

        ## Usum illum regem dubites nil origo inquit
        
        Lorem markdownum liquefacta aconiton avitis at **fatorum** septem, eminet
        inportunusque lumina candidioribus ensem. Pudibundaque datum: pectora aetas,
        fertis quibus vitibus, spiritus, contende. Oderit dabitur. Contulit *accepere
        caput*.
        
        Signum Gyaros comes, ac sentit invadunt vivit: non tot, furtim! Tolles
        instructa: dissimilemque diva: flumen: e vultum dentibus furibundus ubera,
        discussisque turis carnes, non. **Mihi** atque victor metuit poenam pressit meam
        sed erant coeptum sibi, factaque ut unus, est. Unum spectatae, tundunt tibi.
        Rhesum et quin.
        
        ## Rursus aere
        
        Ac Iolao Famem postibus pennis, isse obiecit retro procerum coniunx lacer Iovis
        frondibus iuvenco? Texta illo exspectabam lacrimis: est et pudori in longa,
        foret et flexerat plausis suscitat adflatuque esse modo, coeunt?
        
        ## Poplite ponto
        
        Aut geminas capto cognoscite est discedite plumas? Impediunt poenas, videt et
        manifestam postquam, in nemus.
        
        Gaudia constitit petunt *calidi maenala nec* turea qui, eundem. Hoc pereat
        uterque possidet *turget talia* praepetibus nomina, veris? Amaris distulit
        dedimus genus prehensis, latitantia mihi Tempe inquit, nec. Ab
        [illa](http://www.haud-fretum.io/nisidabitur.php).
        
        ## In offensa voracior sinunt suae me
        
        Adnuit dicam aevo decrescunt instabiles dives, uti est communiter verum. Tellus
        communis in quoniam rege requiem ortos ex hunc verti invictumque, rictus carmen
        inpune. Obliquo sui non *quem pisce* quantum, terras, fuge.
        
        > Ornata sopita hinc; et in haec cognataque avertere subiectatque mediam. Ora
        > *est est* pars spectans locoque suo, [non](http://ergo.net/) unde erroresque
        > scylla tardius adfusaque sed in. Et orbi. Notissima ingentibus nostra dedere
        > [humum cur](http://www.cycneia-protinus.io/sic.php) aliasque pudet se a aditus
        > O quam admovet quoque exsatiata fugacem fiet nato. Patet Memnonis denique:
        > coniugis volentem invito *Laomedonque* ossa crescente exululatque telis
        > aspiciunt formosus acres?
        
        ## Honesta facta albentes arbore
        
        Nec celat vela dignos serta victor esse tumulo plantas, sum orant venientia
        Sidonide cervice. At [conpulit plura](http://cum.com/aetherias). Quoque
        participes vertit et insania satis. Quaecumque **tua**, est in caput capacis
        colunt, iam neu inane.
        
        Mediamque Arachnes? Colles *sed aspiciunt* suos det non tetigisset Oribasos
        lucente, tertius tibi, cum et erat. Comas spectant totidemque et tamen infelix:
        Hyacinthe nunc per vobis et parantis spes Invidiae *terram natum*, victrixque.`
    ], [
        1,
        "My other blog",
        "Even more reasons why I am cool",
        faker.date.past(),
        `# Et rogant natarum gelidaeque fertur belli quo

        ## Annos dura
        
        Lorem markdownum dempserat non tuae, sui sinit properent nobiliumque sola
        **Pelasga**. Pomum Romulus est nec aliquo me numen vocari, obprobrium soror; cum
        usa. Res totidemque postquam pharetrae argentea haesit haud spectacula passa
        moenia, uterque, secundo viderat ero. Valet poenas et timor rigida subiecta
        **est simus** versus transformat humili circa rostro: avertite Herculis Aeneas?
        
            homeWormAiff = recursive + process;
            if (outputIrqUp(vlbQwertyNetwork, minimize_restore_google(dataWimax), fiber)
                    > double_vga.drop(server, language_internal_footer -
                    qbe_sata_menu)) {
                http_exif(uri_cybercrime, 325765, device);
            }
            if (archive_remote.multitaskingNas.compression_snow_hyperlink(cpcGamma,
                    text_monochrome) <= defaultGatewayBlog) {
                tweet_leaf.switch_function = dsl;
                winsVerticalIpod -= compileWebThumbnail + variable_sidebar_ripcording +
                        kindle_odbc.white_wiki_utility.source(453734);
            } else {
                gigahertz -= 1;
                ring_antivirus_desktop += internic;
            }
            software.wiredDataServer(-2, esportsGoogle + undo_mirror_terabyte, asp_mp);
            if (booleanDramHexadecimal + utilitySms.party_boot(io_fsb, flat) !=
                    system_gpu_ldap) {
                document = 1 + 3;
                inputSwipeFlat.bootDashboard = 29;
            }
        
        ## Cedere manu aere ingens
        
        Dixi suci Oenopiam, et euntis e toro aptus tenet tu Thyoneus naris. Satis aer
        forte eodem, imoque bibulas? Est illo fugat arbore canebat ponti magico: perque
        malas tamen; *haud nec* sed numen intonat fornacibus!
        
        Siqua nectareis sinuavi parabantur heros dixit. Pete qui nec nominibus quarum.
        
        ## Norint curvi abundet insequitur bello te operosae
        
        De igne Alcyone, [commentaque](http://www.a-lactis.com/precatur-cognovi), palmis
        fodiebant sinunt super: illa facta pueri ama maxime materiam huius. Ab pectora
        supposito bracchia pressos modo crimine; nomen primus magis. Sacerdos latuere
        nudare; tibi quid se et [magna](http://natonec.io/quod); tibi. Praetendens vela
        cacumina tellus, latebant copia verba averserisque facit bracchia magno; et.
        *Tacebitur herba* oraque undas talis ventus officio riget est arma tetigit.
        
            device = serp.sd(ocr_node_installer.cable_gopher_switch(1));
            apple(passwordLock, delMemePython + oem / 5);
            circuit.hyperlinkFpuIpad /= tDragSaas(logDockingSearch, 5, newsgroup);
            hsfExpansion.json(84, iosKeystrokeWebmaster(skyscraper_error(35),
                    intellectualNybbleLte));
            if (software) {
                minisite_stack.ebookBit(vdsl_flatbed_sync + input, wi);
                cybercrime_master_gibibyte = page_bar;
            } else {
                dialog.bot_analyst_overwrite(gibibyteAgpDebugger(reader, tebibyteIbm,
                        ircFrozen), bar, e_speed_firewall(system_up_c, systemSolid));
                graphic_point_gnu = -4;
                trimKbpsDocking.basicInstall(system_power_clock, -5);
            }
        
        ## Quis nec
        
        [Dona bracchia](http://ulva.org/frenis), festa precibus sub regi nati genialis
        pars quoque. Bacis exstimulat nequeunt conlapsosque Capys linguae non litore,
        ille iuppiter fertur, crura. Atque sonantia ille silentum, Dianae. Non genuum
        candentem convicti *cum*!
        
        Glaebis quid, ereptaque sequar. Diva cursus, sua inter, prius, est potestas
        graves. Domui postquam Tellus Euboica campi praesentia equos sitis, tellus
        subiecta me viret talaribus quoque! **Conbibitur** tertius sum eluvie femur.`
    ], [
        3,
        "A blog in Latin",
        "Lorem lorem lorem!!!",
        faker.date.past(),
        `# Morabar plangoris erat

        ## At Cadme sic nec erat resupinus sustinet
        
        Lorem markdownum. Est premit misce, in versa mortale prius admonuisse ossaque
        inserui.
        
        Ille oves: nescio: ense nullo! Lernaei tristi iam deiecto **colla vino**, et
        saxi inplet ira meo mille inquit! Est semiferos parte patientia recedere,
        figuras aera, nec *ventris* pedes.
        
            stickTextPlug += cdCpsFunction;
            horizontal_servlet_internal(dramOsiMenu + pcmcia, thirdInteractiveDisk);
            computing_cpl.rpcDslamUnix = alert;
        
        ## Gestasset portus
        
        Dempsistis amisit, **quacumque** et oscula insula alis, ipse qua animalia
        fortibus, visi. Morati Herculeamque ductus; Damasicthona saepe sacra amori
        habitabilis viaque sequuntur [innato emicat
        gravet](http://visoscelus.org/sagittissucos.aspx) quicquam ense sacra femina
        rependatur putes. Deus longius evolvit Scorpion populo, caruerunt primos posuere
        Ultima, postquam Orithyiae videri magnum!
        
            core_trinitron = shareware;
            if (driveCycle) {
                realNewsgroupQbe /= sequence;
                boolean_horizontal = web.dpi_dual(firmware_backside, snapshot_memory,
                        dlcLosslessLeaf * 3);
            }
            var wildcard = -3 + rupRteGnu;
        
        Lateo tardior. Congestaque mixtus, vasti qua, flumen flectere
        [flendo](http://inlustro.net/capiuntanimam) stridunt venit in regnorum tempora
        largoque iacentia parva? Inprudens gelidum loquerentur ingenti auctoremque natum
        scissaeque forumque: eras dixit cernunt **metuendus**, licet iubes iubar; mota.
        Restabat rabida tandem acutae et cadit. Arce servet: et illi sive coepta
        revulsum os hostis.
        
        - Gurgite opem populos Iuno dicunt
        - Caput curvamine arduus est parvo enim viderat
        - Videre natumque iurat victoria
        
        Restabat Nilo, metu *editus*, ora **relatis vertit** consistere parentes nisi
        deduxit excussit **Dymantis** formosa, *nutricisque saxo Hesperio*. Negant
        quibus crescitque quondam maiora! Quid gurgite pudor praeter: pervigilem
        proceres aliqua removit; caputque mihi. Hectora ictae faciunt quas tibi nec ab
        tamen corporis scitabere alis tenere neque tanta.`
    ]],
    comments: [[
        3,
        1,
        "Nice post!",
        faker.date.past()
    ], [
        2,
        3,
        "I hate this",
        faker.date.past()
    ], [
        1,
        3,
        "We learned a lot from this blog post",
        faker.date.past()
    ]],
    likes: [[1, 1], [2, 1], [3, 2], [1, 3], [3, 1], [2, 3]],
    comment_likes: [[1, 1], [2, 1], [2, 3], [3, 3], [1, 3]],
    replies: [[
        3,
        3,
        "Thank you!!!"
    ], [
        1,
        2,
        "How very negative of you. At least be constructive."
    ], [
        2,
        2,
        "No u"
    ], [
        1,
        3,
        "You're welcome, keep it up!"
    ], [
        2,
        1,
        "Its alright"
    ], [
        3,
        1,
        "Why do you comment on everything?"
    ], [
        2,
        1,
        "lol"
    ]],
    tags: [["blog"], ["cool"], ["funny"], ["beautiful"], ["amazing"], ["dev"], ["magic"], ["saucy"], ["gr8"], ["gr9"], ["trash"]],
    post_tags: [
        [1, 1], [1, 2], [1, 4], [1, 5], [1, 6],
        [2, 3], [2, 7], [2, 10],
        [3, 4], [3, 6], [3, 8], [3, 9]
    ],
    comment_tags: [
        [1, 2], [1, 5], [1, 7],
        [2, 11], [2, 9],
        [3, 4], [3, 5], [3, 1]
    ],
    hashUsers: function (users) {
        return new Promise((resolve, reject) => {
            users.forEach((user) => {
                hashPW(user[2])
                    .then((hash) => {
                        user[2] = `${hash}`
                        resolve(users)
                    }).catch(e => reject(e))

            })
        })
    },
    manyUsers: function (num) {
        // this.numUsers = num
        return Array(num).fill("x").map(() => [faker.internet.email(), faker.internet.userName(), faker.internet.password(), faker.date.past()])
    },
    manyProfiles: function () {
        return Array(this.numUsers - 3).fill("x").map((_, i) => [i + 4, faker.lorem.sentence(Math.floor(Math.random() * 20)), Math.random() < .75 ? faker.internet.avatar() : null])
    },
    manyFollows: function (num) {
        let users = this.numUsers;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * users) + 1])
    },
    manyPosts: function (num) {
        let users = this.numUsers
        // const arr = []
        // for (let i = 0; i < num; i++) {
        //     const { data } = await randomMarkdown()
        //     const content = data || faker.lorem.paragraphs(10, '\n\n')
        //     arr.push([Math.floor(Math.random() * users) + 1, faker.random.words(Math.floor(Math.random() * 15)), faker.lorem.sentence(), faker.date.past(), `![alt_text](${faker.image.abstract()})\n${content}`])
        // }
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, faker.random.words(Math.floor(Math.random() * 15)), faker.lorem.sentence(), faker.date.past(), faker.lorem.text()])
    },
    manyComments: function (num) {
        let users = this.numUsers
        let posts = this.numPosts
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * posts) + 1, faker.lorem.sentence(), faker.date.past()])
    },
    manyReplies: function (num) {
        let users = this.numUsers
        let comments = this.numComments
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * comments) + 1, faker.lorem.words(Math.floor(Math.random() * 20))])
    },
    manyTags: function (num) {
        return Array(num).fill("x").map(() => [faker.random.word().toLowerCase().replace(/\s+/g, '')])
    },
    manyUserTags: function (num) {
        let tags = this.numTags;
        let users = this.numUsers;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * tags) + 1])
    },
    manyPostTags: function (num) {
        let tags = this.numTags;
        let posts = this.numPosts;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * posts) + 1, Math.floor(Math.random() * tags) + 1])
    },
    manyCommentTags: function (num) {
        let tags = this.numTags;
        let comments = this.numComments;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * comments) + 1, Math.floor(Math.random() * tags) + 1])
    },
    manyLikes: function (num) {
        let users = this.numUsers;
        let posts = this.numPosts;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * posts) + 1])
    },
    manyCommentLikes: function (num) {
        let users = this.numUsers
        let comments = this.numComments;
        return Array(num).fill("x").map(() => [Math.floor(Math.random() * users) + 1, Math.floor(Math.random() * comments) + 1])
    }
}


const resetDB = (done) => {
    const query1 = `DROP DATABASE IF EXISTS ${database}`;
    const query2 = `CREATE DATABASE IF NOT EXISTS ${database}`;
    seedDB.hashUsers(seedDB.usersHashed).then(() => {
        return queryDB(query1)
    })
        .then(() => queryDB(query2))
        .then(() => queryDB(`USE ${database}`))
        .then(() => Promise.all([queryDB(userSchema.create), queryDB(postSchema.create)]))
        .then(() => done ? done() : null).catch(e => console.log(e))
}
const resetTables = (done) => {
    seedDB.numUsers = 3
    queryDB(`
        SET FOREIGN_KEY_CHECKS = 0;
        ${userSchema.drop};
        ${profileSchema.drop};
        ${followSchema.drop};
        ${postSchema.drop};
        ${likeSchema.drop};
        ${commentSchema.drop};
        ${commentLikeSchema.drop};
        ${replySchema.drop};
        ${tagSchema.drop};
        ${postTagSchema.drop};
        ${commentTagSchema.drop};
        ${userTagSchema.drop};
        SET FOREIGN_KEY_CHECKS = 1;
  `).then(() => Promise.all([
        queryDB(userSchema.create),
        queryDB(profileSchema.create),
        queryDB(followSchema.create),
        queryDB(postSchema.create),
        queryDB(likeSchema.create),
        queryDB(commentSchema.create),
        queryDB(commentLikeSchema.create),
        queryDB(replySchema.create),
        queryDB(tagSchema.create),
        queryDB(postTagSchema.create),
        queryDB(commentTagSchema.create),
        queryDB(userTagSchema.create)
    ]))
        .then(() => queryDB(`INSERT INTO users (email, username, pswd) VALUES ?`, [seedDB.usersHashed])
            .then(() => queryDB(`INSERT INTO profiles (user_id, about, photo_path) VALUES ?`, [seedDB.profiles]))
            .then(() => queryDB(`INSERT INTO follows (followee_id, follower_id) VALUES ?`, [seedDB.follows]))
            .then(() => queryDB(`INSERT INTO tags (tag_name) VALUES ?`, [seedDB.tags]))
            .then(() => queryDB(`INSERT INTO posts (user_id, title, caption, created_at, post_content) VALUES ?`, [seedDB.posts]))
            .then(() => Promise.all([
                queryDB(`INSERT INTO likes (user_id, post_id) VALUES ?`, [seedDB.likes]),
                queryDB(`INSERT INTO comments (user_id, post_id, comment_text, created_at) VALUES ?`, [seedDB.comments]),
                queryDB(`INSERT INTO post_tags (post_id, tag_id) VALUES ?`, [seedDB.post_tags])
            ]))
            .then(() => Promise.all([
                queryDB(`INSERT INTO comment_tags (comment_id, tag_id) VALUES ?`, [seedDB.comment_tags]),
                queryDB(`INSERT INTO user_tags (user_id, tag_id) VALUES ?`, [seedDB.userTags]),
                queryDB(`INSERT INTO comment_likes (user_id, comment_id) VALUES ?`, [seedDB.comment_likes]),
                queryDB(`INSERT INTO replies (user_id, comment_id, reply_text) VALUES ?`, [seedDB.replies])
            ]))
            .then(() => done()).catch(e => {
                if (done) {
                    return done(e)
                }
                throw e
            }))
}


module.exports = { seedDB, resetDB, resetTables }