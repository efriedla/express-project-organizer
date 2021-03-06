var express = require('express');
var db = require('../models');
var router = express.Router();
var async = require('async');

// POST /projects - create a new project
router.post('/', function(req, res) {
    db.project.create({
        name: req.body.name,
        githubLink: req.body.githubLink,
        deployedLink: req.body.deployedLink,
        description: req.body.description
    }).then(function(newProject) {
        var categories = [];
        if (req.body.category) {
            categories = req.body.category.split(",");
        }
        if (categories.length > 0) {
            async.forEachSeries(categories, function(category, callback) {
                //functions that runs for each category

                // 2. insert one or many categories for this one project
                db.category.findOrCreate({
                    where: { name: category.trim() }
                }).spread(function(category, wasCreated) {
                    // add the info into the join table

                    // 3. populating the join table for each category for that project
                    newProject.addCategory(category);
                    callback();
                });
            }, function() {
                //runs when everything is done
                res.redirect("/");
            });
        } else {
            res.redirect("/");
        }
    }).catch(function(error) {
        res.status(400).render('main/404');
    });
});

// GET /projects/new - display form for creating a new project
router.get('/new', function(req, res) {
    res.render('projects/new');
});

// GET /projects/:id - display a specific project
router.get('/:id', function(req, res) {
    db.project.find({
            where: { id: req.params.id }
        })
        .then(function(project) {
            if (!project) throw Error();
            res.render('projects/show', { project: project });
        })
        .catch(function(error) {
            res.status(400).render('main/404');
        });
});

module.exports = router;
