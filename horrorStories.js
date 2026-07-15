// =====================================
// HORROR STORIES DATABASE
// =====================================


module.exports = {



    // =====================================
    // 🏚️ CASA ABBANDONATA
    // =====================================


    casa_abbandonata:{


        title:
        "🏚️ La Casa Abbandonata",



        description:
        "Una vecchia casa dimenticata. Nessuno entra da anni... ma questa notte una luce è apparsa al suo interno.",



        start:"entrata",



        scenes:{



            entrata:{


                text:
`
Sei davanti alla casa.

La porta è aperta.

Dentro senti un rumore.

Puoi:

🚪 Entrare nella casa
🌲 Tornare indietro
`,

                choices:{


                    entra:{
                        text:"🚪 Entrare",
                        next:"salone"
                    },


                    torna:{
                        text:"🌲 Andarsene",
                        ending:"paura"

                    }


                }


            },





            salone:{


                text:
`
Il salone è pieno di polvere.

Sul tavolo trovi qualcosa...

C'è una vecchia lettera.
`,

                item:
                "lettera_insanguinata",


                choices:{


                    scala:{
                        text:"🪜 Salire le scale",
                        next:"camera"
                    },


                    porta:{
                        text:"🚪 Aprire la porta del seminterrato",
                        next:"cantina"
                    }


                }


            },





            camera:{


                text:
`
La camera è vuota.

Sul muro c'è una fotografia.

Sembra mostrare qualcuno che ti sta osservando.
`,

                item:
                "foto_vecchia",


                choices:{


                    continua:{
                        text:"🔍 Cercare ancora",
                        ending:"segreto"
                    }


                }


            },





            cantina:{


                text:
`
La cantina è completamente buia.

Trovi una vecchia chiave vicino a una scatola.
`,

                item:
                "chiave_arrugginita",


                choices:{


                    usa:{
                        text:"🔑 Usare la chiave",
                        ending:"vero_finale"
                    }


                }


            }


        },



        endings:{


            paura:
            "Hai deciso di scappare. Ma quella luce... continua a seguirti.",



            segreto:
            "Hai scoperto una verità nascosta nella casa. Forse non eri solo.",



            vero_finale:
            "La chiave apre una stanza nascosta. Dentro trovi il motivo per cui nessuno è mai tornato."

        }


    },









    // =====================================
    // 🌲 BOSCO SENZA RITORNO
    // =====================================


    bosco_nero:{


        title:
        "🌲 Il Bosco Senza Ritorno",


        description:
        "Un bosco dove gli esploratori spariscono misteriosamente.",


        start:
        "ingresso",


        scenes:{


            ingresso:{


                text:
`
Entri nel bosco.

Gli alberi sembrano muoversi.

Davanti a te ci sono due sentieri.
`,


                choices:{


                    sinistra:{
                        text:"🌑 Sentiero oscuro",
                        next:"oscuro"
                    },


                    destra:{
                        text:"🔥 Sentiero illuminato",
                        next:"luce"
                    }


                }


            },


            oscuro:{


                text:
`
Trovi un simbolo inciso su un albero.
`,


                item:
                "simbolo_strano",


                choices:{


                    avanti:{
                        text:"➡️ Continuare",
                        ending:"bosco_segreto"
                    }

                }


            },


            luce:{


                text:
`
Trovi una vecchia torcia abbandonata.
`,


                item:
                "torcia_rotta",


                choices:{


                    continua:{
                        text:"➡️ Continuare",
                        ending:"perso"

                    }


                }


            }


        },



        endings:{


            bosco_segreto:
            "Il simbolo ti porta davanti a qualcosa che nessuno aveva mai trovato.",


            perso:
            "Il bosco ti inghiotte. Nessuno saprà mai dove sei finito."

        }


    },








    // =====================================
    // 🏥 OSPEDALE DIMENTICATO
    // =====================================


    ospedale_dimenticato:{


        title:
        "🏥 L'Ospedale Dimenticato",


        description:
        "Un vecchio ospedale chiuso dopo strani eventi.",


        start:
        "ingresso",


        scenes:{


            ingresso:{


                text:
`
Le porte dell'ospedale si aprono lentamente.

Senti una registrazione partire...
`,


                item:
                "cassetta_misteriosa",


                choices:{


                    avanti:{
                        text:"🚪 Entrare",
                        ending:"ospedale_finale"
                    }

                }


            }


        },


        endings:{


            ospedale_finale:
            "La registrazione raccontava proprio la tua presenza nell'edificio."

        }


    },









    // =====================================
    // 🚇 STAZIONE VUOTA
    // =====================================


    stazione_vuota:{


        title:
        "🚇 La Stazione Vuota",


        description:
        "Una stazione abbandonata dove arriva ancora un treno.",


        start:
        "binario",


        scenes:{


            binario:{


                text:
`
Sei solo sul binario.

Un treno arriva senza conducente.
`,


                choices:{


                    salire:{
                        text:"🚆 Salire sul treno",
                        ending:"treno"
                    }

                }


            }


        },


        endings:{


            treno:
            "Il treno parte verso una destinazione che non esiste sulle mappe."

        }


    },









    // =====================================
    // 🧪 LABORATORIO 13
    // =====================================


    laboratorio_13:{


        title:
        "🧪 Laboratorio 13",


        description:
        "Un laboratorio segreto abbandonato dopo un esperimento fallito.",


        start:
        "porta",


        scenes:{


            porta:{


                text:
`
Davanti a te c'è una porta blindata.

Qualcuno ha lasciato un medaglione.
`,


                item:
                "medaglione_nero",


                choices:{


                    apri:{
                        text:"🔓 Aprire",
                        ending:"esperimento"

                    }

                }


            }


        },


        endings:{


            esperimento:
            "Il laboratorio nascondeva un esperimento ancora attivo."

        }


    }



};
