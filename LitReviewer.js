const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const { Parser }  = require('json2csv');

const combinedCsv = './combined.csv'
const acceptedCsv = './accepted.csv'
const authorsCsv = './authors.csv'
const sourceFolder = './reviews/'
let combinedReviews = {};
let combinedCsvData = [];
let acceptedCsvData = [];
let authors = {};

let paperFields = ['Paper #', 'Title', 'Authors', 'Year', 'Pdf'];
let reviewFields = [
    { label: 'Reviewer', value: 'Reviewer', default: '' },
    { label: 'Decision', value: 'Decision', default: '' },
    { label: '1a Type of research', value: '1a', default: '' },
    { label: '1b Includes participants', value: '1b', default: '' },
    { label: '1c Role of participants in research', value: '1c', default: '' },
    { label: '1c Specify', value: '1c Specify', default: '' },
    { label: '1d Challenges to carrying out research described', value: '1d', default: '' },
    { label: '1d Specify', value: '1d Specify', default: '' },
    { label: '2a Target participants/focus community', value: '2a', default: '' },
    { label: '2b Specific qualities of target group', value: '2b', default: '' },
    { label: '2b Specify', value: '2b Specify', default: '' },
    { label: '2c Age of women', value: '2c', default: '' },
    { label: '2d Bangladesh participants', value: '2d', default: '' },
    { label: '3a Empowerment intention classification', value: '3a', default: '' },
    { label: '3b Empowerment intentions of research', value: '3b', default: '' },
    { label: '3b Specify', value: '3b Specify', default: '' },
    { label: '3c Empowerment evaluation', value: '3c', default: '' },
    { label: '3c Specify', value: '3c Specify', default: '' },
    { label: '3d Empowerment outcomes/benefits', value: '3d', default: '' },
    { label: '3d Specify', value: '3d Specify', default: '' },
    { label: '3e Challenges to empowering participants through research', value: '3e', default: '' },
    { label: '3e Specify', value: '3e Specify', default: '' },
    { label: '4a Presence of technology in study', value: '4a', default: '' },
    { label: '4b ICT type', value: '4b', default: '' },
    { label: '4c Role of ICT in the research', value: '4c', default: '' },
    { label: '5a Thoughts on research quality', value: '5a', default: '' },
    { label: '5a Specify', value: '5a Specify', default: '' },
    { label: '5b - General comments', value: '5b', default: '' },
]
const compareFields = ['1a','1b','1c','1d','2a','2b','2c','2d','3a','3b','3c','3d','3e','4a','4b','4c','5a']

function writeToFile(filename, data)
{
    try 
    {
        // remove any existing data file
        fs.unlinkSync(filename);        
    } 
    catch(err) 
    {
        console.log("No existing version of " + filename)
    }

    fs.writeFileSync(filename, data)
}

async function readReviews(filename)
{
    try 
    {
        let csvContent = await fs.promises.readFile(`${sourceFolder}/${filename}`)
        let reviews = parse(csvContent)
        let reviewer = filename.slice(0, -4);

        // skip header row
        for(let i = 1; i < reviews.length; i++)
        {
            if(!combinedReviews[i])
            {
                combinedReviews[i] = {}
                combinedReviews[i][paperFields[0]] = i;
                combinedReviews[i][paperFields[1]] = reviews[i][2].trim();
                combinedReviews[i][paperFields[2]] = reviews[i][3].trim();
                combinedReviews[i][paperFields[3]] = reviews[i][7].trim();
                combinedReviews[i].Reviews = {};
            }

            if(!combinedReviews[i].Pdf && reviews[i][4])
            {
                combinedReviews[i].Pdf = reviews[i][4].trim();
            }

            if(!reviews[i][15]) continue;
            
            let thisReview = {};

            thisReview[reviewFields[0].value] = reviewer;
            thisReview[reviewFields[1].value] = reviews[i][15].trim();
            thisReview[reviewFields[2].value] = reviews[i][16].trim();
            thisReview[reviewFields[3].value] = reviews[i][17].trim();
            thisReview[reviewFields[4].value] = reviews[i][18].trim();
            thisReview[reviewFields[5].value] = reviews[i][19].trim();
            thisReview[reviewFields[6].value] = reviews[i][20].trim();
            thisReview[reviewFields[7].value] = reviews[i][21].trim();
            thisReview[reviewFields[8].value] = reviews[i][22].trim();
            thisReview[reviewFields[9].value] = reviews[i][23].trim();
            thisReview[reviewFields[10].value] = reviews[i][24].trim();
            thisReview[reviewFields[11].value] = reviews[i][25].trim();
            thisReview[reviewFields[12].value] = reviews[i][26].trim();
            thisReview[reviewFields[13].value] = reviews[i][27].trim();
            thisReview[reviewFields[14].value] = reviews[i][28].trim();
            thisReview[reviewFields[15].value] = reviews[i][29].trim();
            thisReview[reviewFields[16].value] = reviews[i][30].trim();
            thisReview[reviewFields[17].value] = reviews[i][31].trim();
            thisReview[reviewFields[18].value] = reviews[i][32].trim();
            thisReview[reviewFields[19].value] = reviews[i][33].trim();
            thisReview[reviewFields[20].value] = reviews[i][34].trim();
            thisReview[reviewFields[21].value] = reviews[i][35].trim();
            thisReview[reviewFields[22].value] = reviews[i][36].trim();
            thisReview[reviewFields[23].value] = reviews[i][37].trim();
            thisReview[reviewFields[24].value] = reviews[i][38].trim();
            thisReview[reviewFields[25].value] = reviews[i][39].trim();
            thisReview[reviewFields[26].value] = reviews[i][40].trim();

            combinedReviews[i].Reviews[reviewer] = thisReview;
        }
    } 
    catch (error) 
    {
        console.log(error)
    }
}

(async function(){
    try 
    {
        // Read all of the individual review files and pull out their data
        let files = fs.readdirSync(sourceFolder);
        let promises = [];

        files.forEach(async (filename) => {

            promises.push(readReviews(filename));
        });

        await Promise.all(promises);

        for(const paper in combinedReviews)
        {
            let dataCopy =  JSON.parse(JSON.stringify(combinedReviews[paper]));
            let forced = null;
            let decision = null;
            let agreed = true;
            let count = 0;
            let totalScore = 0;
            let numReviews = Object.keys(dataCopy.Reviews).length;
            let reviewerRows = [];
            
            if(!!dataCopy.Reviews && numReviews > 0)
            {
                decision = dataCopy.Reviews[Object.keys(dataCopy.Reviews)[0]].Decision
    
                delete dataCopy.Reviews;
    
                for(const reviewer in combinedReviews[paper].Reviews)
                {
                    let review = combinedReviews[paper].Reviews[reviewer];
                    let reviewData = {...dataCopy, ...combinedReviews[paper].Reviews[reviewer]};
                    combinedCsvData.push(reviewData);
                    reviewerRows.push(reviewData)
                    count++;
                    totalScore += review['5a'].includes("5a.1") ? 3 : review['5a'].includes("5a.2") ? 2 : 1;
                    agreed = agreed && (review.Decision.includes("0.1") == decision.includes("0.1"));
                    if(review.Decision.includes("!"))
                    {
                        forced = reviewer.toUpperCase();
                        decision = review.Decision;
                    }                    
                }
            }

            delete dataCopy.Reviews;
            let message = !decision ? "NOT REVIEWED" : forced ? "EXECUTIVE DECISION BY " + forced : count < 2 ? "NEEDS CONFIRMING" : !agreed ? "DISAGREEMENT" : "AGREED"
            dataCopy[paperFields[0]] = 'RESULT ' + dataCopy[paperFields[0]];

            let decisionRes = (agreed && count >=2) || forced ? decision.includes("0.1") ? "ACCEPTED" : "REJECTED" : 'WAITING'

            combinedCsvData.push({...dataCopy, ...{'Reviewer' : message, 'Decision' : decisionRes}})

            if(((agreed && count >=2) || forced) && decision && decision.includes("0.1"))
            {
                // paper accepted for inclusion
                let codes = {}
                let firstReviewer = true;
                reviewerRows.forEach(rev => {
                    acceptedCsvData.push(rev);

                    for(key in rev)
                    {
                        if(compareFields.includes(key) && rev[key].includes(key))
                        {
                            let code = rev[key].split(key + '.').pop();
                            if(code)
                            {
                                code = key + '.' + code.charAt(0);
                                if(firstReviewer)
                                {
                                    codes[key] = code;
                                }
                                else
                                {
                                    if(codes[key] != code)
                                    {
                                        codes[key] = 'MISMATCH'
                                    }
                                }
                            }
                        }

                    }
                    firstReviewer = false;
                });

                acceptedCsvData.push({...dataCopy, ...{'Reviewer' : message, 'Decision' : decisionRes}, ...codes})
                
                //add/update author stats
                let paperScore = totalScore / numReviews;
                let paperAuthors = dataCopy.Authors.split(";");

                for(const author in paperAuthors)
                {
                    let name = paperAuthors[author].trim();
                    if(!authors[name])
                    {
                        authors[name] = {
                            'Name' : name,
                            'NumPapersAccepted' : 1,
                            'NumFirstAuthor' : author == 0 ? 1 : 0,
                            'AvgScore' : paperScore
                        }
                    }
                    else
                    {
                        if(author == 0) authors[name].NumFirstAuthor++;
                        authors[name].AvgScore = (authors[name].NumPapersAccepted * authors[name].AvgScore + paperScore) / (authors[name].NumPapersAccepted + 1);
                        authors[name].NumPapersAccepted++;
                    }
                }
            }
        }


        let authorsArr = Object.values(authors);
        authorsArr.sort((a, b) => b.NumPapersAccepted - a.NumPapersAccepted);

        const authors2csvParser = new Parser({ fields: ['Name', 'NumPapersAccepted', 'NumFirstAuthor',  'AvgScore'], defaultValue : " ", includeEmptyRows : true });
        const authorsCsvData = authors2csvParser.parse(authorsArr);
        writeToFile(authorsCsv, authorsCsvData)

        // combined CSV
        const json2csvParser = new Parser({ fields: paperFields.concat(reviewFields), defaultValue : " ", includeEmptyRows : true });
        writeToFile(combinedCsv, json2csvParser.parse(combinedCsvData));

        // accepted papers only CSV
        writeToFile(acceptedCsv, json2csvParser.parse(acceptedCsvData));

        console.log("Done!")
    } 
    catch (error) 
    {
        console.error(error)
    }
})();