# fight-blue-bird

This is the trial to complete the game *fight-blue-bird* like [FlappyBird](https://en.wikipedia.org/wiki/Flappy_Bird) with [genetic algorithm](https://en.wikipedia.org/wiki/Genetic_algorithm)

# How to do trial

Double click `index_ga.html`, open it with some internet browser. And you can see the blue bird is flying. Please cheer him/her.

# Explanation for the screen

![fight-blue-bird-ga](https://github.com/kanlkan/fight-blue-bird/blob/master/resource/fight_blue_bird_ga.png)

(1) Generation No - Gene No - Gene element No

* Generation
    * The unit of crossing over and selection and sometimes mutation among 32 genes
* Gene
    * 32 genes / 1 generation
* Gene elements
    * Gene has 100 elements
    * Each element mean the bird's action every 0.2 seconds
        * Action : *Jump* or *Do nothing*

(2) Max fitness in all generations

* Fitness
    * In this case, fitness is the time[seconds] between *start game* and *game over*
* The number in "()" is the generation number which get that max fitness

(3) History of fitness

# Extra

Double click `index.html`, you can play the fight-blue-bird by yourself.

* How to contorol
    * *Space* : Jump
    * *j* : down the cursor
    * *k* : up the cursor
    * *Enter* : Select on title screen

# Detail resource (in Japanese)
https://qiita.com/kanlkan/items/83fa9a660b1d9ef83b36
