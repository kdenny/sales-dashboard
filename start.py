import sys
import sqlite3

from flask import Flask, jsonify
from flask import render_template
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, support_credentials=True)

DATABASE = "./recruit.db"

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def query_db(query):

    result_dict = {}

    try:
        connection = sqlite3.connect(DATABASE)

        cursor = connection.cursor()
        cursor.execute(query)
        result_dict = dictfetchall(cursor)

    except sqlite3.OperationalError as e:
        print("Db operation error", e)
        result_dict["error"] = str(e)
    except:
        e = sys.exc_info()[0]
        print("An error occurred with the database", e)
        result_dict["error"] = str(e)
    else:
        cursor.close()
        connection.close()

    return result_dict


@app.route('/')
def index():
    return render_template('index.html')

# @app.route('/api/state_pops', methods=['GET'])
# def state_pops():
#     sp = []
#     with open("state_pops.csv","rt") as ifile:
#         rd = csv.DictReader(ifile)
#         for row in rd:
#             sp.append(row)
#
#     return jsonify({'data': sp})

@app.route('/api/max_income', methods=['GET'])
def api_test():

    result_dict = query_db("select gender, max(income) as max_income from customer group by gender")
    # print(result_dict)

    return jsonify({'data': result_dict})

@app.route('/api/all', methods=['GET'])
@cross_origin(supports_credentials=True)
def api_all():
    result_dict = query_db("select round(income/25)*25 as income_bucket, count(c.id) as customers, e.value as education, state, is_smoker, is_exerciser, round(travel_spending/250)*250 as travel_spend_bucket, round(sports_leisure_spending/250)*250 as sports_leisure_spend_bucket, i.value as segment, round((travel_spending+sports_leisure_spending)/500)*500 as discretionary_spending from customer c left join education e on c.education_id = e.id left join insurance_segment i on c.insurance_segment_id = i.id group by income_bucket, education, state, is_smoker, is_exerciser, sports_leisure_spend_bucket, travel_spend_bucket, segment")

    return jsonify({'data': result_dict})

if __name__ == '__main__':
    app.run()
