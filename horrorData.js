module.exports = [

{
    id: 1,

    title: "🏚️ La Casa Abbandonata",

    start: "start",

    nodes: {

        start: {

            text:
`Ti trovi davanti ad una casa abbandonata.

La porta è socchiusa.

Cosa fai?`,

            choices: [

                {
                    label: "🚪 Entra",
                    next: "inside"
                },

                {
                    label: "🌲 Vai nel bosco",
                    next: "forest"
                }

            ]

        },



        inside: {

            text:
`La porta si chiude da sola.

Sul tavolo trovi una CHIAVE.`,

            item: "🔑 Chiave",

            choices: [

                {

                    label:"📖 Leggi il diario",

                    next:"diary"

                },

                {

                    label:"⬆️ Sali le scale",

                    next:"stairs"

                }

            ]

        },



        diary: {

            text:
`Nel diario c'è scritto:

"Non guardare mai sotto il letto."`,

            choices:[

                {

                    label:"🛏️ Guarda sotto il letto",

                    next:"monster"

                },

                {

                    label:"🚪 Esci",

                    next:"escape"

                }

            ]

        },



        stairs:{

            text:
`Al piano superiore trovi una LETTERA sporca di sangue.`,

            item:"📜 Lettera Insanguinata",

            choices:[

                {

                    label:"🔓 Apri la porta",

                    next:"good"

                }

            ]

        },



        forest:{

            text:
`Nel bosco senti qualcuno seguirti...`,

            choices:[

                {

                    label:"🏃 Corri",

                    next:"bad"

                }

            ]

        },



        monster:{

            ending:true,

            text:
`☠️ Un mostro ti afferra.

FINAL 1
MORTE`

        },



        bad:{

            ending:true,

            text:
`☠️ Ti perdi nel bosco.

FINAL 2
SMARRITO`

        },



        escape:{

            ending:true,

            text:
`🏃 Riesci ad uscire vivo.

FINAL 3
FUGA`

        },



        good:{

            ending:true,

            text:
`🏆 Hai scoperto il segreto della casa.

FINAL 4
VERITÀ`

        }

    }

},




{
    id:2,

    title:"🚇 La Metropolitana",

    start:"start",

    nodes:{

        start:{

            text:
`L'ultima metropolitana è vuota.

Senti dei passi.`,

            choices:[

                {

                    label:"🚃 Cambia vagone",

                    next:"wagon"

                },

                {

                    label:"🚪 Scendi",

                    next:"station"

                }

            ]

        },



        wagon:{

            ending:true,

            text:
`☠️ Qualcuno era già lì.

FINAL`

        },



        station:{

            ending:true,

            text:
`🏆 Riesci a scappare.

FINAL`

        }

    }

},




{
    id:3,

    title:"🏥 Ospedale",

    start:"start",

    nodes:{

        start:{

            text:
`L'ospedale è completamente vuoto.`,

            choices:[

                {

                    label:"💉 Sala operatoria",

                    next:"op"

                }

            ]

        },



        op:{

            ending:true,

            text:
`☠️ Qualcosa si muove dietro di te.`

        }

    }

},




{
    id:4,

    title:"🕳️ Il Bunker",

    start:"start",

    nodes:{

        start:{

            text:
`Trovi un bunker sotterraneo.`,

            choices:[

                {

                    label:"🔦 Accendi torcia",

                    next:"light"

                }

            ]

        },



        light:{

            ending:true,

            text:
`🏆 Trovi l'uscita.`

        }

    }

},




{
    id:5,

    title:"🌑 La Foresta Nera",

    start:"start",

    nodes:{

        start:{

            text:
`Una foresta dove nessuno torna.`,

            choices:[

                {

                    label:"🌲 Continua",

                    next:"end"

                }

            ]

        },



        end:{

            ending:true,

            text:
`☠️ Hai sentito l'ultimo urlo.`

        }

    }

}

];
