// Test $text with $textScore projection.

var t = db.getSiblingDB("test").getCollection("fts_projection");
t.drop();

db.adminCommand({setParameter: 1, textSearchEnabled: true});
db.adminCommand({setParameter: 1, newQueryFrameworkEnabled: true});

t.insert({_id: 0, a: "textual content"});
t.insert({_id: 1, a: "additional content"});
t.insert({_id: 2, a: "irrelevant content"});
t.ensureIndex({a:"text"});

// Project the text score.
var results = t.find({$text: {$search: "textual content -irrelevant"}}, {_idCopy:0, score:{$meta: "text"}}).toArray();
// printjson(results);
// Scores should exist.
assert.eq(results.length, 2);
assert(results[0].score);
assert(results[1].score);

//
// Edge/error cases:
//

// Project text score into 2 fields.
results = t.find({$text: {$search: "textual content -irrelevant"}}, {otherScore: {$meta: "text"}, score:{$meta: "text"}}).toArray();
// printjson(results);

// Project text score into "x.$" shouldn't crash
assert.throws(function() { t.find({$text: {$search: "textual content -irrelevant"}}, {'x.$': {$meta: "text"}}).toArray(); });

// TODO: We can't project 'x.y':1 and 'x':1 (yet).

// TODO: Clobber an existing field and behave nicely.

// Don't crash if we have no text score.
var results = t.find({a: /text/}, {score: {$meta: "text"}}).toArray();
// printjson(results);

// No textScore proj. with nested fields
assert.throws(function() { t.find({$text: {$search: "blah"}}, {'x.y':{$meta: "text"}}).toArray(); });
