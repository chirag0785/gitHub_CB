const express=require('express');
const router=express.Router();
const userController=require('../controller/user');
router.get('/',userController.getHome);
router.get('/search',userController.getUser);
router.get('/search/:username/:repo',userController.getRepo);

router.get('/search/:username/:repo/contributors',userController.getContributors);

router.get('/search/:username/:repo/commitactivity',userController.getCommitActivity);
router.get('/profile',userController.getProfile);
router.get('/:username/repos/sort/stars',userController.getRepoSortByStars);
router.get('/:username/repos/sort/forks',userController.getRepoSortByForks);
router.get('/:username/repos/sort/open_issues',userController.getRepoSortByIssues);
router.get('/:username/repos/sort/name',userController.getRepoSortByName);
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});
module.exports=router;