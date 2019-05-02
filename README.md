# wx-aggregator
A weather forecast aggregator build on NodeJS, Serverless.

## Purpose
- Aggregate as many available weather forecast sources as possible in one place.
- Starting with NYC metro. We will add more metro areas per demand. 
- Compute a simple aggregate average forecast of all sources for the queried ZIP code

## Architecture
- Based on the concept here: https://sanderknape.com/2017/05/building-a-serverless-website-in-aws/
- All data and the client site will be hosted on S3, various lambda functions will serve to update data.
- A React app (built with Preact) will render the client.

```
     AGGREGATOR λ EXECUTES AFTER API λS HAVE
     POPULATED THEIR JSONS. FOR EVERY ZIP, IT
     SUMS AND AVERAGES THE FORECAST DATA POINTS
     FROM EACH FORECAST API SOURCE AND OUTPUTS
     THAT TO DATA TO A NEW JSON

                +----------------+                        SEARCH λ TAKES IN A
                |                |                        ZIP SEARCH TERM AND
          +-----+  AGGREGATOR λ  <------+                 REFERENCES IT AGAINST
          |     |                |      |                 THE JSON FOR EACH
          |     +----------------+      |                 FORECAST API SOURCE
          |                             |                 AS WELL AS THE
          |                             |                 AGGREGATE AVERAGE.
          |   +---------------------------------------+   IT PASSES THIS JSON               CLIENT (ALSO ON S3)
          |   |                         |             |   TO THE CLIENT APP'S
          |   |    S3 BUCKET (JSON OBJS)|             |   REACT COMPONENTS FOR    X+-----------------------------------+X
          |   |                         |             |   RENDERING.              +                                     +
X+------------------------------------------------+   |                           |      +-----------------------+      |
+         |   |                         |         |   |           +----------------------+     SEARCH INPUT      |      |
|         |   |                         |         |   |           |               |      +-----------------------+      |
|  +------v---v--+                      |         |   |           |               |                                     |
|  |             |                      |         |   |           |               |                                     |
|  |  AGGREGATE  |      +---------------+-----+   |   |           |               |                                     |
|  |             |      |                     |   |   |           |               |                                     |
|  +-------------+      |                     |   |   |    +------v---+           |                                     |
|                       |  INDIVIDUAL JSONS   |   |   |    |          |           |                                     |
|                       |  FOR EACH FORECAST  <-------+----> SEARCH λ +--------+  |    +---------------------------+    |
|   +----------+        |  API SOURCE         |   |        |          |        |  |    |    REACT COMPONENTS FOR   |    |
|   |          |        |                     |   |        +------+---+        +------->    EACH FORECAST SOURCE   |    |
|   | ZIPCODES |        |                     |   |               |            |  |    |                           |    |
|   |          |        +---------------^-----+   |               |            |  |    +---------------------------+    |
|   +-+--------+                        |         |               |            |  |    |                           |    |
|     |                                 |         |               |            +------->    AGGREGATOR COMPONENT   |    |
+     |                                 |         |               |               |    |                           |    |
X+------------------------------------------------+               |               |    +---------------------------+    |
      |                                 |                         |               |                                     |
      |                                 |                         |               +                                     +
      |                                 |                         |               X+-----------------------------------+X
      |                                 |                         |
      |                            +----+-----+                   |
      |                            |          |                   |
      +---------------------------->  API λS  <-------------------+
                                   |          |
                                   +--+---^---+
                                      |   |         API λS ARE TRIGGERED IF SEARCH DOESN'T
                                      |   |         FIND AN EXISTING FORECAST JSON FOR THE
                                      |   |         SUBMITTED ZIP CODE THAT'S LESS THAN 6
                                      |   |         HOURS OLD. IF SUCH A FILE ALREADY EXISTS,
                               +------v---+------+  NO ADDITIONAL API CALLS ARE NEEDED.
                               |                 |
                               |                 |
                               |  EXTERNAL APIS  |
                               |                 |
                               |                 |
                               +-----------------+

```


## Install & Setup

### Requirements
AWS CLI
Python 2 version 2.6.5+ or Python 3 version 3.3

