//##### Config's #####//

//##### input's #####//
input = sessionStorage.getItem("_input").toUpperCase();
output = sessionStorage.getItem("_output").toUpperCase();

sessionStorage.setItem("_input","");
sessionStorage.setItem("_output","");

if (input.length <= 0 || output.length <= 0) {

	window.location = 'index.html';

}

//##### timer's #####//
start_all = 1000;//1000 // time until it starts (loading time)
between_letters = 200;//200 // time between letters apearence
start_fade = 5000;//5000 // time until letters start to fade
between_fade = 400;//400 // time between letters fade 
between_fade_letters = 500;//1000 // time between images of letter to fade
between_fade_parts = 1000;//1500 // time delay for parts to fade
toBlack_fade_time = 1000;//1000 // time delay to fade to black
fade_time_out = 1000;//1000 //time to fade out when exit pressed

//##### sound's #####//
sound = true; // music

//##################//

height = 690;

start_point_x = 0; //don't change
start_point_y = height/2-35; //don't change
inner_padding = 56; //don't change
grid_max_y = 5; //don't change
between_dis_apr = between_fade_parts/2;//don't change
fade_time = between_fade_letters+500/grid_max_y;//don't change
buttons_fade_time = 500; //don't change

width = (Math.max(input.length, output.length) * inner_padding)-28;

invalid_chars = ['A_4.png', 'C_4.png', 'D_3.png', 'D_4.png', 'E_4.png', 'ESPACO.png', 'F_4', 'H_4.png', 'I_4.png', 'J_4.png', 'K_4.png', 'L_3.png', 'L_4.png', 'M_4.png', 'N_4.png', 'S_4.png', 'T_3.png', 'T_4.png', 'U_4.png', 'V_3.png', 'V_4.png', 'W_4.png', 'X_3.png', 'X_4.png', 'Y_4.png', 'Z_4.png']; 

var death_screen = new Phaser.Game(width, height, Phaser.CANVAS, 'screen', { preload: preload, create: create, update: update });

var count = 0,
    count_2 = 0,
    n = 0,
    now = 0,
    now_2 = 0,
    order = [];

function preload(){
    death_screen.load.atlasJSONHash('full', 'assets/images/full.png', 'assets/images/full.json');
    death_screen.load.spritesheet('continue', 'assets/images/continue.png', 487, 60);
    death_screen.load.spritesheet('exit', 'assets/images/exit.png', 241, 58);
    death_screen.load.audio('music', 'assets/sounds/music.ogg');
    death_screen.load.audio('end', 'assets/sounds/end.ogg');
    death_screen.load.audio('select', 'assets/sounds/select.ogg');
    death_screen.load.audio('letter_fadeAway', 'assets/sounds/letter_fadeAway.ogg');
    death_screen.load.audio('letter_fadeIn', 'assets/sounds/letter_fadeIn.ogg');
}

function create(){

    death_screen.stage.backgroundColor = '#c8cbdd';

    music_aud = death_screen.add.audio('music');
    end_aud = death_screen.add.audio('end');
    select_aud = death_screen.add.audio('select');
    letter_fadeAway_aud = death_screen.add.audio('letter_fadeAway');
    letter_fadeIn_aud = death_screen.add.audio('letter_fadeIn');

    if (sound) {
        music_aud.play();
    }

    input_new = new Array;
    output_new = new Array;
    texture_position = [[]];

    for (var i = 0; i < input.length; i++) {
        input_new[i] = input[i];
    }

    for (var i = 0; i < output.length; i++) {
        output_new[i] = output[i];
    }

    if (input_new.length > output_new.length) {

        len = input_new.length - output_new.length;

        if (len%2 == 0 && len/2 >= 1) {
            for (var i = 0; i < len/2; i++) {
                output_new.unshift(' ');
                output_new.push(' ');
            }
        }else if (len/2 >= 1) {
            for (var i = 0; i < (len+1)/2; i++) {
                output_new.unshift(' ');
            }

            for (var i = 0; i < Math.abs(len/2); i++) {
                output_new.push(' ');
            }
        }else{
            output_new.unshift(' ');
        }

    }else if(output_new.length > input_new.length) {

        len = output_new.length - input_new.length;

        if (len%2 == 0 && len/2 >= 1) {
            for (var i = 0; i < len/2; i++) {
                input_new.unshift(' ');
                input_new.push(' ');
            }
        }else if (len/2 >= 1) {
            for (var i = 0; i < (len+1)/2; i++) {
                input_new.unshift(' ');
            }

            for (var i = 0; i < Math.abs(len/2); i++) {
                input_new.push(' ');
            }
        }else{
            input_new.unshift(' ');
        }
    }

    grid_max_x = input_new.length + output_new.length;

    for (var i = 0 ; i < grid_max_x; i++) {
        texture_position[i] = [];
    }

    for (var i = 0; i < (output_new.length&&input_new.length); i++) {
        Letter(input_new[i],i,1);
        Letter(output_new[i],i,2);
    }

    for (var i = 0; i < grid_max_x; i++) {
        for (var j = 1; j < grid_max_y; j++) {
            texture_position[i][j].alpha = 0;
        }
    }

    poss_order = shuffle_letters();

    timer = death_screen.time.create(false);
    timer.loop(start_all, alfaOff, this);
    timer.start();

    timer1 = death_screen.time.create(false);
    timer1.loop(between_letters, alfaOff, this);

    timer2 = death_screen.time.create(false);
    timer2.loop(start_fade, callFadeLetter, this);

    timer3 = death_screen.time.create(false);
    timer3.loop(between_fade, callFadeLetter, this);

    timer4 = death_screen.time.create(false);
    timer4.loop(toBlack_fade_time, fadeBlack, this);
}

function update(){

}

function Letter(letter, poss, line){
    if (line == 1) {
        line = 0;
    }else{
        line = grid_max_x/2;
    }

    for (var i = 1; i < grid_max_y; i++) {
        if (letter != ' ' && letter != letter.toLowerCase()) {
            texture_position[poss+line][i] = death_screen.add.sprite(start_point_x + (inner_padding * poss), start_point_y, 'full', (letter + '_' + i + '.png'));
        }else if (letter == ' ') {
            texture_position[poss+line][i] = death_screen.add.sprite(start_point_x + (inner_padding * poss), start_point_y, 'full', 'ESPACO.png');
        }   
    }
}

function alfaOff(){
    timer.stop();
    timer1.start();

    if (n < grid_max_x/2) {
        for (var i = 0; i <= grid_max_y; i++) {
            if (texture_position[n][i] != (undefined||null)) {
                texture_position[n][i].alpha = 1;

                if (sound && texture_position[n][i]._frame.name != 'ESPACO.png') {
                    letter_fadeIn_aud.stop();
                    letter_fadeIn_aud.play();
                }

            }
        }
        n++;
    }else{
        timer1.stop();
        timer2.start();
    }
}

function shuffle_letters() {
    nums = [];

    for (var i = 0; i < input_new.length; i++) {
        nums.push(i);
    }

    ranNums = [],
    i = nums.length,
    j = 0;

while (i--) {
    j = Math.floor(Math.random() * (i+1));
    ranNums.push(nums[j]);
    nums.splice(j,1);
}

    return ranNums;
}

function shuffle_order(){
    nums = [];

    for (var i = 1; i < grid_max_y; i++) {
        nums.push(i);
    }

    ranNums = [],
    i = nums.length,
    j = 0;

    while (i--) {
        j = Math.floor(Math.random() * (i+1));
        ranNums.push(nums[j]);
        nums.splice(j,1);
    }

    return ranNums;
}

function callFadeLetter(){
    timer2.stop();
    timer3.start();

    if (count == 0) {

        exit_button = death_screen.add.button(width -151, height/2 + 70, 'exit', exitClick, this, 1, 0);
        continue_button = death_screen.add.button(width -488, height/2 + 70, 'continue', continueClick, this, 1, 0);

        exit_button.alpha = 0;
        continue_button.alpha = 0;
        exit_button.scale.x = 0.5;
        exit_button.scale.y = 0.5;
        continue_button.scale.x = 0.5;
        continue_button.scale.y = 0.5;

        death_screen.add.tween(continue_button).to( { alpha: 1 }, buttons_fade_time, Phaser.Easing.Linear.None, true);
        death_screen.add.tween(exit_button).to( { alpha: 1 }, buttons_fade_time, Phaser.Easing.Linear.None, true);

    }

    if (count < poss_order.length) {
        
        death_screen.time.events.loop(Phaser.Timer.SECOND*(between_fade_letters/1000), fadeLetter, this);

    }else{

        timer4.start();
        timer3.stop();

        console.log("Done!");
    }
}

function fadeLetter(){

    poss = poss_order[count];

    if (count_2 == 0) {
        order = shuffle_order();
    }

    if (count_2 < grid_max_y && poss < poss_order.length && texture_position[poss][order[count_2]] != (undefined||null)) {

        if (now < death_screen.time.now) {
            death_screen.add.tween(texture_position[poss][order[count_2]]).to( { alpha: 0 }, fade_time, Phaser.Easing.Linear.None, true);

            if (texture_position[poss + (grid_max_x/2)][order[count_2]] != (undefined||null) && now_2 < death_screen.time.now) {
                death_screen.add.tween(texture_position[poss + (grid_max_x/2)][order[count_2]]).to( { alpha: 1 }, fade_time, Phaser.Easing.Linear.None, true);
                now_2 = death_screen.time.now + between_dis_apr;
            }

            count_2++;
            now = death_screen.time.now + between_fade_parts;
        }

    }else{

        if (count < poss_order.length) {
            count++;
            count_2 = 0;

            if (sound && texture_position[poss][1]._frame.name != 'ESPACO.png') {
                letter_fadeAway_aud.stop();
                letter_fadeAway_aud.play();
            }
        }

    }  
    
}

function fadeBlack(){
    timer4.stop();

    if (sound) {
        music_aud.stop();
        end_aud.play();
    }

    for (var i = 0; i < output_new.length; i++) {
            for (var j = 1; j < grid_max_y; j++) {
                if (texture_position[Math.abs(i+grid_max_x/2)][j] != (undefined||null)) {
                    tweenTint(texture_position[Math.abs(i+grid_max_x/2)][j]);
                }  
            }           
        }

    tweenTint(continue_button);
    tweenTint(exit_button);
}

function tweenTint(obj) {
    startColor = 0xffffff;
    endColor = 0x000000;
    time = 3000;
 
    var colorBlend = {step: 0};
    var colorTween = death_screen.add.tween(colorBlend).to({step: 100}, time, Phaser.Easing.Default, false);

    colorTween.onUpdateCallback(function() {      
       obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step, 1);      
    });

    obj.tint = startColor

    colorTween.start();
}

function continueClick(){

    if (sound) {
        select_aud.play();
    }

    between_fade = between_fade/100; 
    between_fade_letters = between_fade_letters/100;
    between_fade_parts = between_fade_parts/100;
    between_dis_apr = 10;
    fade_time = 10;

}

function exitClick(){
    if (sound) {
        select_aud.play();
    }

    window.location = 'index.html';
}

