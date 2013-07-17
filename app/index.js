'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');
var _s = require('underscore.string');
var check = require('validator').check;


var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);


  this.on('end', function () {
    if (options['git']) {
      // Git Init
      var repo = 'git@github.com:' + this.ghRepo + '.git';
      var projectDir = this.projectDir;
      spawn('git', ['init'], {cwd: this.projectDir}).on('close', function() {
        // If we have a GitHub Repo, we're going to add the remote origin as well
        if (repo) {
          spawn('git', ['remote', 'add', 'origin', repo], {cwd: projectDir}).on('close', function() {
            console.log("I've added the remote origin, pointing to " + projectDir);
          });
        }
        else {
          console.log("I've initialized Git for you.");
        }
      });
    }

    if (!options['skip-install']) {
      // Spawn commands
      // Each will output their buffer unless the --slient flag is passed
      // Also available, this.spawnCommand

      // Bundle Install
      var projectDir = this.projectDir;
      spawn('bundle', ['install'], {cwd: this.projectDir}).stdout.on('data', function(data) {
        if (!options['silent']) {
          console.log(data.toString());
        }
      }).on('close', function() {
        if (options['git'] && options['commit']) {
          spawn('git', ['add', '.'], {cwd: projectDir}).on('close', function() {
            spawn('git', ['commit', '-m', '"Initial Commit"'], {cwd: projectDir});
          });
        }
      });

      // Bower Install
      spawn('bower', ['install'], {cwd: this.projectDir}).stdout.on('data', function(data) {
        if (!options['silent']) {
          console.log(data.toString());
        }
      });

      // NPM Install
      spawn('npm', ['install'], {cwd: this.projectDir}).stdout.on('data', function(data) {
        if (!options['silent']) {
          console.log(data.toString());
        }
      });

      // Log the install
      console.log("\nI'm all done! If your installs did not finish properly, run ".white + "bundle install & bower install & npm install".yellow + " to finish installation.");
    }
    else {
      var bye = "\n I'm all done! Now run ".white + "bundle install & bower install & npm install".yellow + " to finish installation.";
      console.log(bye);
    }
  });

  // var sys = require('sys');
  // var exec = require('child_process').exec;
  // function puts(error, stdout, stderr) {sys.puts(stdout)}

  // exec('bundle install', puts);

  // this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  var welcome =
  '\n .______   .______       _______     _______. _______ .__   __. .___________.    ___   .___________. __    ______   .__   __. '.green +
  '\n |   _  \\  |   _  \\     |   ____|   /       ||   ____||  \\ |  | |           |   /   \\  |           ||  |  /  __  \\  |  \\ |  |'.green +
  '\n |  |_)  | |  |_)  |    |  |__     |   (----`|  |__   |   \\|  | `---|  |----`  /  ^  \\ `---|  |----`|  | |  |  |  | |   \\|  | '.green +
  '\n |   ___/  |      /     |   __|     \\   \\    |   __|  |  . `  |     |  |      /  /_\\  \\    |  |     |  | |  |  |  | |  . `  | '.green +
  "\n |  |      |  |\\  \\----.|  |____.----)   |   |  |____ |  |\\   |     |  |     /  _____  \\   |  |     |  | |  `--'  | |  |\\   | ".green +
  '\n | _|      | _| `._____||_______|_______/    |_______||__| \\__|     |__|    /__/     \\__\\  |__|     |__|  \\______/  |__| \\__|'.green;

  console.log(welcome);
  console.log("\nMake a Snugug presentation\n");

    var prompts = [
      {
        name: 'presName',
        message: 'The name of the presentation. (Required)',
        default: '',
        warning: 'You did include your presentation name.',
        required: true
      },
      {
        name: 'ghRepo',
        message: 'GitHub Repository. [ex: Snugug/Style-Prototyping] (Required)',
        default: '',
        warning: 'You did not include a GitHub Repo.',
        required: true
      }
    ];

  // prompts.push({
  //   name: 'ghDeploy',
  //   message: 'Are you going to deploy to GitHub?',
  //   default: true,
  //   warning: 'You did not specify if you\'re going to deploy to GitHub'
  // });

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit('error', err);
    }

    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.presName = props.presName;
    this.presSlug = _s.slugify(this.presName);
    this.ghRepo = props.ghRepo;
    this.repoUser = this.ghRepo.split('/')[0];
    this.repoName = this.ghRepo.split('/')[1];

    // this.devHost = props.devHost;
    // this.devPort = props.devPort;
    // this.requireJS = props.requireJS;
    this.ghDeploy = true;
    // this.ghDeploy = props.ghDeploy;

    this.projectDir = this.presSlug + '/';
    if (this.options['init']) {
      this.projectDir = './';
    }
    cb();
  }.bind(this));
};

// AppGenerator.prototype.gruntfile = function gruntfile() {
//   this.template('_gruntfile.js', this.projectDir + 'Gruntfile.js');
// };

// AppGenerator.prototype.packageJSON = function packageJSON() {
//   this.template('_package.json', this.projectDir + 'package.json');
// };

// AppGenerator.prototype.git = function git() {
//   this.copy('gitignore', this.projectDir + '.gitignore');
//   this.copy('gitattributes', this.projectDir + '.gitattributes');
// };

// AppGenerator.prototype.bower = function bower() {
//   this.copy('bowerrc', this.projectDir + '.bowerrc');
//   this.template('_bower.json', this.projectDir + 'bower.json');
// };

AppGenerator.prototype.jshint = function jshint() {
  // console.log(this.projectDir);
  this.copy('jshintrc', this.projectDir + '.jshintrc');
};

AppGenerator.prototype.csslint = function csslint() {
  this.copy('csslintrc', this.projectDir + '.csslintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', this.projectDir + '.editorconfig');
};

// AppGenerator.prototype.h5bp = function h5bp() {
//   // this.copy('favicon.ico', 'app/favicon.ico');
//   // this.copy('404.html', 'pages/404.html');
//   // this.copy('robots.txt', 'pages/robots.txt');
//   // this.copy('htaccess', 'pages/.htaccess');
// };

AppGenerator.prototype.app = function app() {
  this.template('_index.html', this.projectDir + 'index.html');

  this.copy('Gemfile', this.projectDir + 'Gemfile');
  this.copy('Gemfile.lock', this.projectDir + 'Gemfile.lock');
  this.copy('config.rb', this.projectDir + 'config.rb');

  this.directory('images', this.projectDir + 'images');
  this.directory('sass', this.projectDir + 'sass');
  this.directory('css', this.projectDir + 'css');
  this.directory('js', this.projectDir + 'js');
  this.directory('lib', this.projectDir + 'lib');
  this.directory('plugin', this.projectDir + 'plugin');
};

// AppGenerator.prototype.compass = function compass() {
//   var today = new Date();
//   this.today = today.getFullYear() + '-' + ('0' + (today.getMonth()+1)).slice(-2) + '-' + ('0' + (today.getDate())).slice(-2);

//   this.template('_extension.json', this.projectDir + '.extension.json');
//   this.template('styleguide.gemspec', this.projectDir + '.compass/' + this.presSlug + '-style-guide.gemspec');
//   this.copy('styleguide.rb', this.projectDir + '.compass/.template/' + this.presSlug + '-style-guide.rb');
//   this.template('manifest.rb', this.projectDir + '.compass/templates/project/manifest.rb');
// };