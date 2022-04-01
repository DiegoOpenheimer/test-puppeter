import excelToJson from 'convert-excel-to-json'
import fs from 'fs';
import { URL } from 'url';
import { promisify } from 'util';
import path from 'path';

function formatterDate(endDate) {
    const valueSplitted = endDate.split('/');
    return `${valueSplitted[2]}-${valueSplitted[1]}`;
}

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

const __dirname = new URL('.', import.meta.url).pathname;

const infoNonRenewables = ['térmica', 'nuclear']

const sheet = 'Sheet 1';

export async function extractData(endDate, data, persist) {
    const writer = fs.createWriteStream(path.join(__dirname, '../data.json'));
    try {
        console.log('Extracting data...', __dirname);
        const buffer = await readFile(path.join(__dirname, `../${persist ? endDate.split('/').join('-') + '/' : ''}Geração de Energia Tipo de Usina.xlsx`));
        const result = excelToJson({
            source: buffer,
        });

        const values = result[sheet]?.slice(1);

        const nonRenewables = values?.filter(info => infoNonRenewables.includes(info.D?.toLowerCase()))?.map(info => info.F);
        const renewables = values?.filter(info => !infoNonRenewables.includes(info.D?.toLowerCase()))?.map(info => info.F);
        console.log('Non-renewables:', nonRenewables);
        console.log('renewables:', renewables);

        const renewable = renewables?.reduce((acc, curr) => acc + curr, 0);
        const nonRenewable = nonRenewables?.reduce((acc, curr) => acc + curr, 0);
        console.log('Total renewable:', renewable);
        console.log('Total non-renewable:', nonRenewable);
        console.log(endDate);
        const info = {
            period: formatterDate(endDate),
            renewable,
            nonRenewable,
        }
        if (!data) {
            writer.write(JSON.stringify([info], null, 2));
        } else {
            writer.write(JSON.stringify([...data, info], null, 2));
        }
    } catch (error) {
        console.log('Error to extract data: ', error);
    } finally {
        writer.close();
        if (!persist) {
            await unlink(path.join(__dirname, '../Geração de Energia Tipo de Usina.xlsx'));
        }
    }
}