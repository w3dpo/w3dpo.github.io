        $(document).ready(function(){
              // Initialize Firebase
              var config = {
                apiKey: "AIzaSyDosuvbjG5mJl0O9nBpJ3-iigHOK5prkbM",
                authDomain: "w3dpo-70603.firebaseapp.com",
                databaseURL: "https://w3dpo-70603.firebaseio.com",
                projectId: "w3dpo-70603",
                storageBucket: "w3dpo-70603.appspot.com",
                messagingSenderId: "490119898557"
              };
              firebase.initializeApp(config);

              if(screen.height > screen.width)
                $(".child").addClass("child80");
            else
                $(".child").addClass("childskinny");

            var AllTeamsArray = [];
            var AllTeamsData, tobedisabled;
            var teamToJudge,judgeName = "random", judgeCategory = "random";
            var b,x=0,a, otherscore;

            var teamsdata, doneJudgingArray = [];

            setTimeout( function(){
                if(window.location.hash == ""){
                    $.mobile.changePage("#login-page");
                }
            },2000);

            firebase.database().ref('Teams/AllTeams').on("value", function(snap){
                AllTeamsData = snap.val();                
                if(AllTeamsData == null){
                    alert("0 teams registered.");
                    AllTeamsArray = [];
                }else{
                    console.log(AllTeamsData);
                    if(AllTeamsData.indexOf(',') == -1)
                        AllTeamsArray = [AllTeamsData];
                    else
                        AllTeamsArray = AllTeamsData.split(',');
                    $("#display-teams").html(AllTeamsData);
                    console.log(AllTeamsArray.length);
                }
            });


            $("#btn-admin-login").on("click", function(){
                var username = $("#login-username").val();
                var password = $("#login-password").val();
                $("#display-teams").fadeOut();
                console.log(username.endsWith("lab"));
                if(username.endsWith("lab")){
                    firebase.auth().signInWithEmailAndPassword(username + "@gmail.com", password).then(e =>{
                        alert("Logged in successfully.");
                        console.log(e.message);
                        $.mobile.changePage("#register-teams");
                    }).catch(e =>{
                        console.log(e.message);
                        $("#error-message").text(e.message);
                    });
                } else{
                    $("#error-message").text("Sorry, you don't have admin rights.");
                }
            });


            $("#btn-register-team").on("click", function(){

                if(!$("#team-name").val() || !$("#team-code").val() || !$("#team-members").val() || $("#team-category").val() == "Choose one..."){
                    $("#warning-register").text("Please fill all the fields.");
                    console.log("please fill all fields");
                }
                else if( !($("#team-code").val().length == 8  && ($("#team-code").val().startsWith("3dpcu") || $("#team-code").val().startsWith("3DPCU")))){
                    $("#warning-register").text("Enter correct registration code.");
                    console.log("Enter correct registration code.");
                }
                else{
                    $("#warning-register").text("");

                    var teamname = $("#team-name").val();
                    var teamcode = $("#team-code").val();
                    teamcode = teamcode.toUpperCase();
                    var teammembers = $("#team-members").val();
                    var teamcategory = $("#team-category").val();
                    var index = AllTeamsArray.indexOf(teamcode);
                    console.log(index);

                    if(index == -1){
                        //increment number
                        firebase.database().ref('TotalRegistrations').once('value').then(function(snap){
                            x=snap.val();
                            ++x;
                            console.log(x);
                            firebase.database().ref('TotalRegistrations').set(x);
                        });
        
                        //update team
                        if(teamcategory == "Primary"){
                            firebase.database().ref("PrimaryCount").once("value").then(function(snap){
                                var x = snap.val();
                                ++x;

                                var eventcode;
                                if(x<10)
                                    eventcode = "P00" + x;
                                else
                                    eventcode = "P0" + x;
                                firebase.database().ref('Teams/Primary/'+ eventcode).set({
                                    EventCode: eventcode,
                                    TeamName: teamname,
                                    RegCode: teamcode,
                                    TeamCategory: teamcategory,
                                    MemberNames: teammembers,
                                    JudgesAvg: 0,
                                    SurpriseElementScore:0
                                });
                                firebase.database().ref("PrimaryCount").set(x);
                                alert("Team Code is " + eventcode);
                            });

                        }else if(teamcategory == "Middle"){
                            firebase.database().ref("MiddleCount").once("value").then(function(snap){
                                var x = snap.val();
                                ++x;
                                var eventcode;
                                if(x<10)
                                    eventcode = "M00" + x;
                                else
                                    eventcode = "M0" + x;

                                firebase.database().ref('Teams/Middle/'+ eventcode).set({
                                    EventCode: eventcode,
                                    TeamName: teamname,
                                    RegCode: teamcode,
                                    TeamCategory: teamcategory,
                                    MemberNames: teammembers,
                                    JudgesAvg: 0,                                    
                                    SurpriseElementScore:0
                                });
                                firebase.database().ref("MiddleCount").set(x);
                                alert("Team Code is " + eventcode);
                            });
                        }else{
                            firebase.database().ref("SecondaryCount").once("value").then(function(snap){
                                var x = snap.val();
                                ++x;
                                var eventcode;
                                if(x<10)
                                    eventcode = "S00" + x;
                                else
                                    eventcode = "S0" + x;

                                firebase.database().ref('Teams/Secondary/'+ eventcode).set({
                                    EventCode: eventcode,
                                    TeamName: teamname,
                                    RegCode: teamcode,
                                    TeamCategory: teamcategory,
                                    MemberNames: teammembers,
                                    JudgesAvg: 0,
                                    SurpriseElementScore:0
                                });
                                firebase.database().ref("SecondaryCount").set(x);
                                alert("Team Code is " + eventcode);
                            });
                        }

                        //update in AllTeams
                        firebase.database().ref('Teams/AllTeams').once('value').then(function(snap){
                            var AllTeams = snap.val();
                            if(AllTeams == null)
                                AllTeams = teamcode;
                            else
                                AllTeams = AllTeams + ',' + teamcode;
                            console.log(AllTeams);
                            firebase.database().ref('Teams/AllTeams').set(AllTeams);
                            alert("Team registered successfully.");
                            $("#team-name").val("");
                            $("#team-members").val("");
                            $("#team-code").val("");
//                          $("#team-category").html("Choose one...");
                        });
                    }else{
                        alert("Team already exists. Use a different registration code.");
                    }
                }
              });

            var openJudgingSheet = function(teamName){
                return function(){
                    teamToJudge = teamName;
                    $("#label-judging-team").text(teamToJudge);
                    if(judgeName == "surprise"){
                        firebase.database().ref("Teams/" + judgeCategory + "/" + teamToJudge + "/JudgesAvg").once("value").then(function(snap){
                            otherscore = parseFloat(snap.val());
                            console.log(otherscore);
                        });
                        $.mobile.changePage("#surprise-rubrics");
                    }
                    else{
                        firebase.database().ref("Teams/" + judgeCategory + "/" + teamToJudge + "/SurpriseElementScore").once("value").then(function(snap){
                            otherscore = parseFloat(snap.val());
                            console.log(otherscore);
                        });
                        $.mobile.changePage("#judging-rubrics");
                    }
                };
            }

            $("#btn-judge-login").on("click", function(){ 
                var username = $("#login-username").val();
                var password = $("#login-password").val();
                firebase.auth().signInWithEmailAndPassword(username + "@gmail.com", password).then(e =>{
                    judgeName = username.toLowerCase();
                    console.log(judgeName);
                    firebase.database().ref("Scoring/" + judgeName + "/FinishedTeams").once("value").then(function(snap){
                        tobedisabled = snap.val();
                        console.log(tobedisabled);
                        if(tobedisabled == null)
                            tobedisabled = "hala";
                    });
                    alert("Logged in successfully.");
                    $.mobile.changePage("#select-category-page");
            }).catch(e =>{
                    console.log(e.message);
                    $("#error-message").text(e.message);
                });
            });

            $("#select-primary").on("click", function(){
                judgeCategory = "Primary";
                $("#list-of-teams").find("button").remove();
                firebase.database().ref("PrimaryCount").once("value").then(function(snap){
                    for (var i = 1; i <= snap.val(); i++) {
                        var btn = document.createElement("button");
                        var btnName;
                        if(i<10)
                            btnName = "P00" + i;
                        else
                            btnName = "P0" + i;
                        btn.innerHTML = btnName;
                        if(tobedisabled.indexOf(btnName) != -1)
                            btn.disabled = true;
                        btn.id = btnName;
                        btn.onclick = openJudgingSheet(btnName);
                        btn.className = "ui-btn";
                        document.getElementById("list-of-teams").appendChild(btn);
                        console.log(btnName);
                    }
                    $.mobile.changePage("#judging-page");
                });
            });

            $("#select-middle").on("click", function(){
                judgeCategory = "Middle";
                $("#list-of-teams").find("button").remove();
                firebase.database().ref("MiddleCount").once("value").then(function(snap){
                    for (var i = 1; i <= snap.val(); i++) {
                        var btn = document.createElement("button");
                        var btnName;
                        if(i<10)
                            btnName = "M00" + i;
                        else
                            btnName = "M0" + i;
                        btn.innerHTML = btnName;
                        if(tobedisabled.indexOf(btnName) != -1)
                            btn.disabled = true;
                        btn.id = btnName;
                        btn.onclick = openJudgingSheet(btnName);
                        btn.className = "ui-btn";
                        document.getElementById("list-of-teams").appendChild(btn);
                        console.log(btnName);
                    }
                    $.mobile.changePage("#judging-page");
                });
            });

            $("#select-secondary").on("click", function(){
                judgeCategory = "Secondary";
                $("#list-of-teams").find("button").remove();
                firebase.database().ref("SecondaryCount").once("value").then(function(snap){
                    for (var i = 1; i <= snap.val(); i++) {
                        var btn = document.createElement("button");
                        var btnName;
                        if(i<10)
                            btnName = "S00" + i;
                        else 
                            btnName = "S0" + i;
                        btn.innerHTML = btnName;
                        if(tobedisabled.indexOf(btnName) != -1)
                            btn.disabled = true;
                        btn.id = btnName;
                        btn.onclick = openJudgingSheet(btnName);
                        btn.className = "ui-btn";
                        document.getElementById("list-of-teams").appendChild(btn);
                        console.log(btnName);
                    }
                    $.mobile.changePage("#judging-page");
                });
            });

            $("#btn-submit-score").on("click", function(){
                var filledcriteria1 = $("#criteria1").val();
                var filledcriteria2 = $("#criteria2").val();
                var filledcriteria3 = $("#criteria3").val();
                var filledcriteria4 = $("#criteria4").val();
                console.log(filledcriteria1);
                filledcriteria1 = parseFloat(filledcriteria1);
                filledcriteria2 = parseFloat(filledcriteria2);
                filledcriteria3 = parseFloat(filledcriteria3);
                filledcriteria4 = parseFloat(filledcriteria4);
                var total = parseFloat(filledcriteria1) + parseFloat(filledcriteria2) + parseFloat(filledcriteria3) + parseFloat(filledcriteria4);
                if(!filledcriteria1 || !filledcriteria2 || !filledcriteria3 || !filledcriteria4)
                    alert("Please fill all the scores");
                else if(filledcriteria1<0 || filledcriteria1 > 20)
                    alert("Please enter criteria1 within the given range.");
                else if(filledcriteria2<0 || filledcriteria2 > 30)
                    alert("Please enter criteria2 within the given range.");
                else if(filledcriteria3<0 || filledcriteria3 > 30)
                    alert("Please enter criteria3 within the given range.");
                else if(filledcriteria4<0 || filledcriteria4 > 20)
                    alert("Please enter criteria4 within the given range.");
                else{
                    firebase.database().ref("Scoring/" + judgeName +"/" + teamToJudge).set({
                        Criteria1: filledcriteria1,
                        Criteria2: filledcriteria2,
                        Criteria3: filledcriteria3,
                        Criteria4: filledcriteria4,
                        TotalAverage: total
                    });

                    firebase.database().ref("Scoring/" + judgeName + "/FinishedTeams").once("value").then(function(snap){
                        var finishedTeams;
                        if(snap.val() == null)
                            finishedTeams = teamToJudge;
                        else
                            finishedTeams = snap.val() + "," + teamToJudge;
                        firebase.database().ref("Scoring/" + judgeName + "/FinishedTeams").set(finishedTeams);
                    });

                    firebase.database().ref("Teams/" + judgeCategory + "/" + teamToJudge).once("value").then(function(snap){
                        var teamDetails = snap.val();
                        var AverageForTeam = 0;
                        var MarksArray = [];
                        var marksMarked = teamDetails["MarksMarked"];
                        var judgesMarked = teamDetails["JudgesMarked"];
                        if(marksMarked == null){
                            marksMarked = total;
                            judgesMarked = judgeName;
                            AverageForTeam = total;
                        }else{
                            var temp;
                            marksMarked = marksMarked + "," + total;
                            judgesMarked = judgesMarked + "," + judgeName;
                            console.log(marksMarked);
                            console.log(judgesMarked);
                            MarksArray = marksMarked.split(",");
                            console.log(MarksArray + "is marks array");
                            temp = 0;
                            for (var i = MarksArray.length - 1; i >= 0; i--) {
                                temp += parseFloat(MarksArray[i]);
                            }
                            AverageForTeam = temp / MarksArray.length;
                        }
                        firebase.database().ref("Teams/" + judgeCategory + "/" + teamToJudge + "/MarksMarked").set(marksMarked);
                        firebase.database().ref("Teams/" + judgeCategory + "/" + teamToJudge + "/JudgesAvg").set(AverageForTeam);
                        firebase.database().ref("Teams/" + judgeCategory + "/" + teamToJudge + "/CombinedScore").set(otherscore + AverageForTeam);
                        firebase.database().ref("Teams/" + judgeCategory + "/" + teamToJudge + "/JudgesMarked").set(judgesMarked);
                        $("#criteria1").val("");
                        $("#criteria2").val("");
                        $("#criteria3").val("");
                        $("#criteria4").val("");
                        document.getElementById(teamToJudge).disabled = true;
                        alert("Score for " + teamToJudge + " submitted successfully!");
                        $.mobile.changePage("#judging-page");
                    });
/*
                    }).catch(e =>{
                        console.log(e.message);
                        alert("ERROR: Not submitted");
                    });
                    */
                }
            });

            $("#btn-submit-surprise").on("click", function(){
                var sport = 0;
                    console.log(otherscore);
                var surprisescore = $("#surprise-score").val();
                console.log(surprisescore);
                surprisescore = parseFloat(surprisescore);
                if($("#sportsmanship").is(":checked"))
                    sport=5;
                var total = surprisescore + sport;
                if(!surprisescore)
                    alert("Please fill the scores");
                else if(surprisescore<0 || surprisescore>20)
                    alert("Please enter score within range.");
                else{
                    firebase.database().ref("Scoring/" + judgeName +"/" + teamToJudge).set({
                        Score: surprisescore,
                        Sportsmanship: sport,
                        SurpriseTotal: total
                    });

                    firebase.database().ref("Scoring/" + judgeName + "/FinishedTeams").once("value").then(function(snap){
                        var finishedTeams;
                        if(snap.val() == null)
                            finishedTeams = teamToJudge;
                        else
                            finishedTeams = snap.val() + "," + teamToJudge;
                        firebase.database().ref("Scoring/" + judgeName + "/FinishedTeams").set(finishedTeams);
                    });

                    firebase.database().ref("Teams/" + judgeCategory + "/" + teamToJudge + "/SurpriseElementScore").set(total);
                    firebase.database().ref("Teams/" + judgeCategory + "/" + teamToJudge + "/CombinedScore").set(otherscore + total);
                    $("#surprise-score").val("");

                    document.getElementById(teamToJudge).disabled = true;
                    alert("Score for " + teamToJudge + " submitted successfully!");
                    $.mobile.changePage("#judging-page");
                }
                });
        });
